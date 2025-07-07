import { CoolController, BaseController } from '@cool-midway/core';
import { UsreCreationEntity } from '../../entity/creation';
import { PromptAppDifyEntity } from '../../../promptApp/entity/appDify';

/**
 * 描述
 */
@CoolController({
  api: ['info', 'list', 'page'],
  entity: UsreCreationEntity,
  pageQueryOp: {
    select: ['a.*', 'b.name as appName'],
    join: [
      {
        entity: PromptAppDifyEntity,
        alias: 'b',
        condition: 'a.appId = b.id',
        type: 'leftJoin',
      },
    ],
  },
})
export class AdminUserCreationController extends BaseController { }
