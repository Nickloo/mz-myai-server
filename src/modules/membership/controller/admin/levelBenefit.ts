import { CoolController, BaseController } from '@cool-midway/core';
import { LevelBenefitEntity } from '../../entity/levelBenefit';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: LevelBenefitEntity,
  pageQueryOp: {
    select: ['a.*', 'b.name as benefitName', 'c.name as levelName'],
    // 根据等级id查询
    fieldEq: ['levelId'],
    join: [
      // 多表查询 权益表
      {
        entity: 'MembershipBenefitEntity',
        alias: 'b',
        condition: 'a.benefitId = b.id',
        type: 'leftJoin'
      },
      // 连接会员等级
      {
        entity: 'MembershipLevelEntity',
        alias: 'c',
        condition: 'a.levelId = c.id',
        type: 'leftJoin'
      }
    ]
  }
})
export class levelBenefitController extends BaseController {}
