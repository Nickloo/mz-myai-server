import { Get, Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { SignEntity } from '../../entity/sign';

/**
 * 活动-配置
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: SignEntity,
})
export class AdminSignController extends BaseController { }
