import { CoolController, BaseController } from '@cool-midway/core';
import { UserAppsEntity } from '../../entity/apps';
import { UserAppsService } from '../../service/apps';
import { Body, Inject, Post } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'list', 'page'],
  entity: UserAppsEntity,
  service: UserAppsService
})
export class AppUserAppsController extends BaseController {

  @Inject()
  ctx: Context;

  @Inject()
  appService: UserAppsService

  @Post('/myAppPage', { summary: '获取我的app列表' })
  async myApps(@Body() body: { appType: number }) {
    const userId = this.ctx.user.id
    const apps = await this.appService.getUserApps(userId, body)
    return this.ok(apps)
  }

  @Post('/remove', { summary: '删除我的app' })
  async removeMyapps(@Body() body: { appId: string }) {
    const { appId } = body
    return this.ok(await this.appService.remove(appId))
  }

  @Post('/checkAndUpdateLastDialog', {
    summary: '检查并修改用户应用的最后一条对话',
  })
  async checkAndUpdateLastDialog(@Body('dialogId') dialogId: string) {
    return this.ok(await this.appService.checkAndUpdateLastDialog(dialogId));
  }
}
