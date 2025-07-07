import { CoolController, BaseController } from '@cool-midway/core';
import { PackageOrderEntity } from '../../../order/entity/packageOrder';

/**
 * 用户订单
 */
@CoolController({
  api: ['page'],
  entity: PackageOrderEntity,
  pageQueryOp: {
    select: [
      'orderNo',
      'packageName',
      'status',
      'amount',
      'payTime',
      'payWay',
      'createTime',
    ],
    fieldEq: ['status', 'orderNo'],
    where: async ctx => {
      // 获取body参数
      return [['a.userId = :userId', { userId: ctx.user.id }]];
    },
  },
})
export class UserPackageOrderController extends BaseController { }
