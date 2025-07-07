import { CoolController, BaseController } from '@cool-midway/core';
import { DocumentEntity } from '../../entity/document';
import { DocumentCategoryEntity } from '../../entity/documentCategory';
/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: DocumentEntity,
  pageQueryOp: {
    select: ['a.*', 'b.name as categoryName'],
    fieldEq: ['a.status', 'categoryId', 'key', 'title'],
    keyWordLikeFields: ['a.content', 'a.title'],
    join: [
      {
        type: 'leftJoin',
        entity: DocumentCategoryEntity,
        alias: 'b',
        condition: 'a.categoryId = b.id',
      },
    ],
  },
})
export class AdminDocumentController extends BaseController { }
