import { CoolController, BaseController } from '@cool-midway/core';
import { DocumentCategoryEntity } from '../../entity/documentCategory';
/**
 * 描述
 */
@CoolController({
  api: ['info', 'list', 'page'],
  entity: DocumentCategoryEntity,
  listQueryOp: {
    where: async () => {
      return [['a.status = 1']];
    },
    addOrderBy: {
      sort: 'asc'
    }
  },
})
export class OpenDocumentCategoryController extends BaseController { }
