import { CoolController, BaseController } from '@cool-midway/core';
import { PromptAppService } from '../../service/apps';
import { PromptAppDifyEntity } from '../../entity/appDify';
import { Get, Inject, Query } from '@midwayjs/core';

/**
 * apps(dify)
 */
@CoolController({
  api: ['page'],
  entity: PromptAppDifyEntity,
  service: PromptAppService,
  // pageQueryOp: {
  //   select: ['id', 'name', 'description', 'icon', 'createTime', 'updateTime'],
  //   keyWordLikeFields: ['name', 'description']
  //   // 不显示的字段
  //   // hiddenFields: ['appSecret']
  // }
})
export class OpenDifyController extends BaseController {

  @Inject()
  appService: PromptAppService;

  @Get('/defaultChat', { summary: '获取默认聊天app' })
  async myDefaultChatApp() {
    return this.ok(await this.appService.getDefaultChatInfo())
  }

  @Get('/appInfo')
  async appInfo(@Query('id') id: string) {
    return this.ok(await this.appService.getOpenAppInfo(id));
  }
}
