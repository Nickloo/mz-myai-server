import { CoolController, BaseController } from '@cool-midway/core';
import { FeedbackEntity } from '../../entity/feedback';

/**
 * 描述
 */
@CoolController({
  api: ['info', 'list', 'page', 'update'],
  entity: FeedbackEntity,
})
export class AdminUserFeedbackController extends BaseController { }
