import { CoolController, BaseController } from '@cool-midway/core';
import { SignLogEntity } from '../../entity/signLog';
import { Provide } from '@midwayjs/core';

/**
 * 描述
 */
@Provide()
@CoolController({
  api: ['delete', 'info', 'list', 'page'],
  entity: SignLogEntity,
})
export class AdminSignLogController extends BaseController {
}
