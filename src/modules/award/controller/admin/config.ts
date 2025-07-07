import { Get, Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { AwardConfigEntity } from '../../entity/config';

/**
 * 活动-配置
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: AwardConfigEntity,
})
export class AdminAwardConfigsController extends BaseController {}
