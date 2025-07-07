import { CoolController, BaseController } from '@cool-midway/core';
import { MessageEntity } from '../../entity/message';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MessageEntity,
  pageQueryOp: {
    keyWordLikeFields: ['content'],
    fieldEq: ['userId', 'senderId', 'senderType', 'dialogId', 'type', 'appType', 'appId', 'status'],
  },
})
export class AdminMessageController extends BaseController {}
