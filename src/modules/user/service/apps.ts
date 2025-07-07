import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { PromptAppDifyEntity } from '../../promptApp/entity/appDify';
import { UserAppsEntity } from '../entity/apps';
import { Context } from '@midwayjs/koa';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { DialogEntity } from '../../dialog/entity/dialog';

/**
 * 描述
 */
@Provide()
export class UserAppsService extends BaseService {

  @Inject()
  ctx: Context;

  @InjectEntityModel(UserAppsEntity)
  userAppsEntity: Repository<UserAppsEntity>;

  @InjectEntityModel(DialogEntity)
  dialogEntity: Repository<DialogEntity>;

  /**
   * 用户添加app
   */
  async add(params: any) {
    const { appId } = params
    const userId = this.ctx.user.id
    // 是否有此app（typeorm appid为空会自动忽略该条件）
    const appInfo = await PromptAppDifyEntity.findOne({ where: { id: appId } })
    if (!appInfo) throw new Error('无此app')
    // 是否已添加
    const userApp = await UserAppsEntity.findOneBy({ appId, userId })
    if (userApp) throw new Error('已添加')
    return await UserAppsEntity.save({ appId, userId })
  }

  /**
   * 用户删除app
   */
  async remove(appId: string) {
    const userId = this.ctx.user.id
    // 是否有此app（typeorm appid为空会自动忽略该条件）
    const appInfo = await PromptAppDifyEntity.findOne({ where: { id: appId } })
    if (!appInfo) throw new Error('无此app')
    // 是否已添加
    const userApp = await UserAppsEntity.findOneBy({ appId, userId })
    if (!userApp) throw new Error('未添加')
    return await UserAppsEntity.delete({ appId, userId })
  }

  /**
   * 获取用户apps
   * @param userId 
   * @param params 
   * @returns 
   */
  async getUserApps(userId: any, params: any) {
    const { appType } = params
    const qb = UserAppsEntity.createQueryBuilder('user_app')
    qb.leftJoinAndSelect('user_app.appInfo', 'appInfo')
      .select([
        'user_app.id', 'user_app.appId', 'user_app.lastestMessage', 'user_app.lastestDialogId', 'user_app.createTime', 'user_app.updateTime',
        'appInfo.id', 'appInfo.name', 'appInfo.description', 'appInfo.icon', 'appInfo.type']) // Select specific fields
      .where('user_app.userId = :userId', { userId })
    if (appType) {
      qb.andWhere('appInfo.type = :appType', { appType })
    }
    qb.orderBy('user_app.updateTime', 'DESC')
    return this.entityRenderPage(qb, params, false)
  }

  /**
   * 检查并修改用户应用的最后一条对话
   * 主要用于用户删除对话后更新自己的应用给
   * @param dialogId 对话id
   */
  async checkAndUpdateLastDialog(dialogId, userId?: any) {
    userId = userId || this.ctx.user.id;
    let userApp = await this.userAppsEntity.findOne({
      where: { lastestDialogId: dialogId },
    });
    if (!userApp) return;

    let userAppLastDialog = await this.dialogEntity.findOne({
      where: { appId: userApp.appId, userId },
      order: {
        updateTime: 'DESC',
      },
    });

    if (userAppLastDialog) {
      userApp.lastestDialogId = userAppLastDialog.id;
      userApp.lastestMessage = userAppLastDialog.lastestMessage;
    } else {
      userApp.lastestDialogId = null;
    }
    await userApp.save();
  }
}
