import { Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { AdvertEntity } from '../../entity/advert';
import { Utils } from '../../utils/index';
/**
 * 描述
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: AdvertEntity,
  insertParam: ctx => {
    let utils = new Utils();
    return {
      no: utils.getNo('AD'),
    };
  },
  pageQueryOp: {
    keyWordLikeFields: ['name'],
  },
  listQueryOp: {},
})
export class AdminAdvertController extends BaseController { }
