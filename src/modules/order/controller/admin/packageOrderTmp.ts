import { CoolController, BaseController } from '@cool-midway/core';
import { PackageOrderTmpEntity } from '../../entity/packageOrderTmp';

/**
 * 描述
 */
@CoolController({
  api: ['info', 'list', 'page'],
  entity: PackageOrderTmpEntity,
})
export class AdminPackageOrderTmpController extends BaseController { }
