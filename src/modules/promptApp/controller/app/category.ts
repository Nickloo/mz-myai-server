import { CoolController, BaseController } from '@cool-midway/core';
import { CategoryEntity } from '../../entity/category';

/**
 * 描述
 */
@CoolController({
  api: ['info', 'list', 'page'],
  entity: CategoryEntity,
  pageQueryOp: {
    // select: ['id', 'name', 'description', 'icon', 'createTime', 'updateTime'],
    keyWordLikeFields: ['name', 'description'],
    fieldEq: ['type','level'],
    // 查status=1
    where: async () => {
      return [
        ['status = :status', { status: 1 }]
      ]
    },
    addOrderBy: { sort: 'ASC' }
    
  }
})
export class AppPromptAppCategoryController extends BaseController {

}
