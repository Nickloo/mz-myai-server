import { CoolController, BaseController } from '@cool-midway/core';
import { PromptAppService } from '../../service/apps';
import { PromptAppDifyEntity } from '../../entity/appDify';
import { Inject } from '@midwayjs/core';

/**
 * apps(dify)
 */
@CoolController({
  api: ['info', 'page'],
  entity: PromptAppDifyEntity,
  service: PromptAppService,
  pageQueryOp: {
    select: [
      'id',
      'name',
      'description',
      'icon',
      'isRecommend',
      'createTime',
      'updateTime',
    ],
    keyWordLikeFields: ['name', 'description'],
    // 不显示的字段
    // hiddenFields: ['appSecret']
  },
})
export class AppDifyController extends BaseController {}
