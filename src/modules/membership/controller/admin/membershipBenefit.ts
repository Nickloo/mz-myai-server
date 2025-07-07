import { CoolController, BaseController } from '@cool-midway/core';
import { MembershipBenefitEntity } from '../../entity/membershipBenefit';

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MembershipBenefitEntity,
})
export class AdminMembershipBenefitController extends BaseController { }
