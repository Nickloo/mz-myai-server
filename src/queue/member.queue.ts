import { Processor, IProcessor } from '@midwayjs/bull';
import { Inject } from '@midwayjs/core';
import { UserMembershipService } from '../modules/user/service/membership';

@Processor('membership')
export class MembershipProcessor implements IProcessor {

  @Inject()
  membershipService: UserMembershipService

  async execute(params) {
    const { action, levelId, userId } = params
    if (action === 'stop') {
      console.log('执行了stop', params);
      this.membershipService.stopUserMembership(levelId, userId)
    }

  }
}