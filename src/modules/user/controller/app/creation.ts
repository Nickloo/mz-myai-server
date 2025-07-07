import { CoolController, BaseController } from '@cool-midway/core';
import { UsreCreationEntity } from '../../entity/creation';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: UsreCreationEntity,
  pageQueryOp: {
    fieldEq: ['appId'],
    where: async (ctx) => {
      // 获取body参数
      const userId = ctx.user.id;
      return [
        ['userId = :userId', { userId }],
      ]
    },
  },
  // 向表插入当前登录用户ID
  insertParam: (ctx => {
    return {
      userId: ctx.user.id
    }
  }),
})
export class AppUserCreationController extends BaseController { }
