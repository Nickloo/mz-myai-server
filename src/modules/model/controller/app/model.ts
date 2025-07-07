import { Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { ModelEntity } from '../../entity/model';

/**
 * 模块-模型
 */
@Provide()
@CoolController({
  api: ['info', 'list', 'page'],
  entity: ModelEntity,
  pageQueryOp: {
    keyWordLikeFields: ['name'],
    fieldEq: ['type']
  }
})
export class AppModelController extends BaseController {}
