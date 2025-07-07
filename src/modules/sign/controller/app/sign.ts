import { Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { SignEntity } from '../../entity/sign';

/**
 * 活动-配置
 */
@Provide()
@CoolController({
  api: ['list', 'page'],
  entity: SignEntity,
})
export class AppSignController extends BaseController { }
