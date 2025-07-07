import { Get, Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { ModelEntity } from '../../entity/model';

/**
 * 模块-模型
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: ModelEntity,
  pageQueryOp: {
    keyWordLikeFields: ['name'],
    fieldEq: ['type']
  }
})
export class AdminModelController extends BaseController {}
