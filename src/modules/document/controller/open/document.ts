import { CoolController, BaseController } from '@cool-midway/core';
import { DocumentEntity } from '../../entity/document';
import { Get, Inject, Query } from '@midwayjs/core';
import { DocumentService } from '../../service/document';
/**
 * 描述
 */
@CoolController({
  api: ['info', 'list', 'page'],
  entity: DocumentEntity,
  pageQueryOp: {
    fieldEq: ['categoryId'],
  },
  listQueryOp: {
    select: ['title', 'id', 'categoryId'],
    where: async () => {
      return [['a.status = 1']];
    },
    addOrderBy: {
      sort: 'asc',
    },
  },
})
export class OpenDocumentController extends BaseController {
  @Inject()
  service: DocumentService;

  @Get('/infoByKey')
  async getInfoByKey(@Query('key') key: any) {
    const data = await this.service.infoByKey(key);
    return this.ok(data);
  }
}
