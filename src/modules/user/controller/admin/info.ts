import { CoolController, BaseController } from '@cool-midway/core';
import { UserInfoEntity } from '../../entity/info';

/**
 * 用户信息
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: UserInfoEntity,
  pageQueryOp: {
    fieldEq: ['status', 'gender', 'loginType', 'isVip', 'id'],
    keyWordLikeFields: ['nickName', 'phone', 'username'],
  },
})
export class AdminUserInfoController extends BaseController {}
