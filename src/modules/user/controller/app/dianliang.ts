import { CoolController, BaseController } from '@cool-midway/core';
import { UserDianliangEntity } from '../../entity/dianliang';

/**
 * 描述
 */
@CoolController({
  api: ['info', 'list', 'page'],
  entity: UserDianliangEntity,
  pageQueryOp: {
    fieldEq: ['type', 'getType'],
    where: async ctx => {
      return [['a.userId = :userId', { userId: ctx.user.id }]];
    },
  },
})
export class AppUserDianliangController extends BaseController { }
