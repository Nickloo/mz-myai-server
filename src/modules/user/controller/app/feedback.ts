import { CoolController, BaseController } from '@cool-midway/core';
import { FeedbackEntity } from '../../entity/feedback';

/**
 * 描述
 */
@CoolController({
  api: ['add'],
  entity: FeedbackEntity,
  insertParam: ctx => {
    return {
      userId: ctx.user.id,
    };
  },
})
export class AppUserFeedbackController extends BaseController { }
