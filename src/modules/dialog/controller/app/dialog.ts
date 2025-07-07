import { CoolController, BaseController } from '@cool-midway/core';
import { DialogEntity } from '../../entity/dialog';
import { Body, Inject, Post } from '@midwayjs/core';
import { DialogService } from '../../service/dialog';
import { Context } from '@midwayjs/koa';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: DialogEntity,
  service: DialogService,
})
export class AppDialogController extends BaseController {

  @Inject()
  ctx: Context

  @Inject()
  dialogService: DialogService

  /**
   * 用户某对话下的所有消息
   * @param body 
   * @returns 
   */
  @Post('/messagePage')
  async dialogMessagePage(@Body() body: any) {
    return this.ok(await this.dialogService.getMyMessagesPage(body))
  }


  @Post('/updateTitle')
  async updateTitle(
    @Body('title') title: string,
    @Body('dialogId') dialogId: string,) {
    if (!title || !dialogId) throw new Error('参数不能为空')
    return this.ok(await this.dialogService.updateTitle(title, dialogId))
  }

  @Post('/updateIcon')
  async updateIcon(
    @Body('icon') icon: string,
    @Body('dialogId') dialogId: string,) {
    if (!icon || !dialogId) throw new Error('参数不能为空')
    return this.ok(await this.dialogService.updateIcon(icon, dialogId))
  }
}
