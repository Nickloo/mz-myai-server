import { CoolController, BaseController } from '@cool-midway/core';
import { DocumentCategoryEntity } from '../../entity/documentCategory';
/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: DocumentCategoryEntity,
  pageQueryOp: {
    fieldEq: ['a.status'],
  },
})
export class AdminDocumentCategoryController extends BaseController { }
