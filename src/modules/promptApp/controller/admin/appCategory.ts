import { CoolController, BaseController } from '@cool-midway/core';
import { PromptAppDifyCategoryEntity } from '../../entity/appCategory';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: PromptAppDifyCategoryEntity,
  listQueryOp: {
    fieldEq: ['categoryId', 'promptAppId']
  }
})
export class AdminPromptAppDifyCategoryController extends BaseController { }
