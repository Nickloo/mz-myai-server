import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { In, Repository } from 'typeorm';
import { DialogEntity } from '../entity/dialog';
import { randomUUID } from '@midwayjs/core/dist/util/uuid';
import { Context } from '@midwayjs/koa';
import { MessageEntity } from '../entity/message';
import { UserAppsEntity } from '../../user/entity/apps';

/**
 * 描述
 */
@Provide()
export class DialogService extends BaseService {
  @InjectEntityModel(DialogEntity)
  dialogEntity: Repository<DialogEntity>;

  @InjectEntityModel(UserAppsEntity)
  userAppsEntity: Repository<UserAppsEntity>;

  @Inject()
  ctx: Context

  /**
   * 重写add
   */
  async add(params: any) {
    const userId = this.ctx.user.id;
    let data = await this.dialogEntity.save({
      id: randomUUID(),
      type: params.type || 1,
      appId: params.appId || '',
      userId,
    });
    // 更新最后一条对话
    this.userAppsEntity.update(
      { userId, appId: params.appId },
      { lastestDialogId: data.id }
    );
    return data;
  }

  /**
   * 我的对话列表
   * @param query 
   * @returns 
   */
  async page(query: any) {
    const { appId } = query
    const userId = this.ctx.user.id
    const find = this.dialogEntity.createQueryBuilder('dialog')
      .where('dialog.userId = :userId', { userId })
    if (appId) {
      find.andWhere('dialog.appId = :appId', { appId })
    }
    find.orderBy('dialog.updateTime', 'DESC')
    // .leftJoinAndSelect('dialog.messages', 'message')
    //   .orderBy('message.createTime', 'DESC')
    //   .take(2)
    // const data = await find.skip((page - 1) * size).take(size).getManyAndCount()
    return await this.entityRenderPage(find, query, false)
  }

  /**
   * 获取messageList page方法
   * 没有dialogId则查全部
   * 带分页
   * TODO: 后面加上是否是user的dialog判断
   */
  async getMyMessagesPage(params: any) {
    const { dialogId } = params
    const userId = this.ctx.user.id
    const find = MessageEntity.createQueryBuilder('message')
      .where('message.userId = :userId', { userId })
    if (dialogId) {
      find.andWhere('message.dialogId = :dialogId', { dialogId })
    }
    return await this.entityRenderPage(find, params)
  }

  // async page(query: any) {
  //   const userId = this.ctx.user.id;
  //   // 主查询
  //   const find = this.dialogEntity.createQueryBuilder('dialog')
  //     .where('dialog.userId = :userId', { userId })
  //     .leftJoinAndSelect(subQuery => {
  //       return subQuery
  //         .from(MessageEntity, 'message') // 假设消息实体名为 MessageEntity
  //         .where('message.dialogId = dialog.id') // 假设每个消息都有指向对话的外键 dialogId
  //         .orderBy('message.createTime', 'DESC')
  //         .take(2); // 限制每个对话获取2条消息
  //     }, 'messages')
  //     .orderBy('dialog.createTime', 'DESC'); // 你可能想要根据对话的某个时间戳字段排序
  //   return await this.entityRenderPage(find, query, false);
  //   // return await find.getMany()
  // }


  /**
   * update title
   * @param title 
   * @returns 
   */
  async updateTitle(title: string, dialogId: string) {
    const userId = this.ctx.user.id
    const dialog = await this.dialogEntity.findOne({ where: { userId, id: dialogId } })
    if (!dialog) {
      throw new CoolCommException('对话不存在')
    }
    dialog.title = title
    return await this.dialogEntity.save(dialog)
  }

  async updateIcon(icon: string, dialogId: string) {
    const userId = this.ctx.user.id
    const dialog = await this.dialogEntity.findOne({ where: { userId, id: dialogId } })
    if (!dialog) {
      throw new CoolCommException('对话不存在')
    }
    dialog.icon = icon
    return await this.dialogEntity.save(dialog)
  }

  /**
   * 删除
   * @param ids
   */
  async delete(ids) {
    const userId = this.ctx.user.id;
    await super.delete(ids);
    if (userId) {
      this.updateUserAppLastDialog(userId, ids);
    }
  }

  /**
   * 更新用户最后一条信息
   * @param userId 用户id
   * @param dialogIds 对话id
   */
  async updateUserAppLastDialog(userId, dialogIds) {
    await this.userAppsEntity.update(
      { userId, lastestDialogId: dialogIds },
      { lastestDialogId: '' }
    );
  }
}
