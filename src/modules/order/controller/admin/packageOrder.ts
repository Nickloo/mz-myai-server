import { CoolController, BaseController } from '@cool-midway/core';
import { PackageOrderEntity } from '../../entity/packageOrder';

/**
 * 描述
 */
@CoolController({
  api: ['info', 'list', 'page'],
  entity: PackageOrderEntity,
  pageQueryOp: {
    keyWordLikeFields: ['orderNo', 'packageName'],
    fieldEq: ['status', 'payWay', 'userId'],
  },
})
export class AdminPackageOrderController extends BaseController { }
