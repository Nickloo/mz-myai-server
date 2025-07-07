import { CoolController, BaseController } from '@cool-midway/core';
import { CategoryEntity } from '../../entity/category';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: CategoryEntity,
  pageQueryOp: {
    fieldEq: ['type', 'status']
  }
})
export class AdminPromptAppCategoryController extends BaseController {

  async getAppCategoryList() {

  }
}
