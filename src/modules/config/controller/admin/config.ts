import { CoolController, BaseController } from '@cool-midway/core';
import { ConfigEntity } from '../../entity/config';
import { Provide } from '@midwayjs/core';
import { ConfigService } from '../../service/config';

/**
 * 描述
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: ConfigEntity,
  service: ConfigService,
})
export class AdminConfigController extends BaseController { }
