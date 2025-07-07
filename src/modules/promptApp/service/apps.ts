import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { PromptAppDifyEntity } from '../entity/appDify';
import { DifyClient } from '../../../libs/dify/difySdk';
import { PromptAppDifyCategoryEntity } from '../entity/appCategory';
import { DialogEntity } from '../../dialog/entity/dialog';
import { Context } from '@midwayjs/koa';

/**
 * 对接Dify的API
 */
@Provide()
export class PromptAppService extends BaseService {
  @InjectEntityModel(PromptAppDifyEntity)
  promptAppEntity: Repository<PromptAppDifyEntity>;

  @InjectEntityModel(DialogEntity)
  dialogEntity: Repository<DialogEntity>;

  @Inject()
  ctx: Context;

  /**
   * 传分类ID，获取分类下的应用列表
   */
  async page(query: any) {
    const { categoryId, appType, keyWord, isRecommend } = query
    const qb = PromptAppDifyCategoryEntity.createQueryBuilder('cat_rel')
    // TODO排除promptApp.appSecret字段
    qb.leftJoin('cat_rel.promptApp', 'app')
      .select([
        'cat_rel.categoryId',
        'app.id',
        'app.name',
        'app.description',
        'app.icon',
        'app.type',
      ]) // Select specific fields
      .where('app.status = 1');
    if (categoryId) {
      qb.andWhere('cat_rel.categoryId = :categoryId', { categoryId });
    }
    if (appType) {
      qb.andWhere('app.type = :appType', { appType });
    }
    if (keyWord) {
      qb.andWhere('(app.name LIKE :keyWord OR app.description LIKE :keyWord)', {
        keyWord: `%${keyWord}%`,
      });
    }
    if (isRecommend === 1 || isRecommend === 0) {
      qb.andWhere('app.isRecommend = :isRecommend', { isRecommend });
    }
    // PromptAppDifyCategoryEntity及其关联的promptApp
    return this.entityRenderPage(qb, query, false);
  }

  /**
   * 应用详情
   * app本身信息+dify的app信息
   */
  async info(id: string) {
    const info = await this.promptAppEntity.findOneBy({ id })
    if (!info) throw Error('应用不存在')
    if(!info.appSecret) throw Error('应用未配置appSecret')
    const difyClient = new DifyClient(info.appSecret)
    const res = await difyClient.getApplicationParameters('ADMIN')
    // 删除敏感信息
    delete info.appSecret
    delete res.data.pre_prompt
    return { ...info, appConfig: res.data }
  }

  /**
   * 获取默认聊天app
   * 妙言AI
   */
  
  async getDefaultChatInfo() {
    const info = await this.promptAppEntity.findOne({
      where: { isDefault: 1, status: 1 },
      select: ['id', 'name', 'description', 'icon']
    })
    if (!info) throw Error('应用不存在')
    return info
  }

  async getAppSecret(id: string) {
    const info = await this.promptAppEntity.findOneBy({ id })
    if (!info) throw Error('应用不存在')
    return info.appSecret
  }

  async getDefaultAppSecret() {
    const info = await this.promptAppEntity.findOne({
      where: { isDefault: 1, status: 1 },
      select: ['appSecret']
    })
    if (!info) throw Error('主应用不存在')
    return info.appSecret
  }

  async getOpenAppInfo(id: string) {
    const info = await this.promptAppEntity.findOneBy({ id });
    let userAppLastDialog = {};
    if (!info) throw Error('应用不存在');
    // if (this.ctx.user.id) {
    //   userAppLastDialog = await this.dialogEntity.findOne({
    //     where: { appId: id, userId: this.ctx.user.id },
    //     order: {
    //       updateTime: 'DESC',
    //     },
    //   });
    // }
    return {
      id: info.id,
      name: info.name,
      description: info.description,
      icon: info.icon,
      type: info.type,
      modelType: info.modelType,
      openingStatement: info.openingStatement,
      userAppLastDialog: userAppLastDialog,
    };
  }
}
