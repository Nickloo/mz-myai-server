import { Body, Inject, Post, Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { MembershipPackageEntity } from '../../entity/package';
import { UserMembershipService } from '../../../user/service/membership';

/**
 * 会员-包
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MembershipPackageEntity,
  pageQueryOp: {
    select: ['a.*', 'b.name as levelName'],
    // 根据等级id查询
    fieldEq: ['levelId', 'validityPeriod'],
    join: [
      // 多表查询 权益表
      {
        entity: 'MembershipLevelEntity',
        alias: 'b',
        condition: 'a.levelId = b.id',
        type: 'leftJoin'
      }
    ]
  }
})
export class AdminMembershipPackagesController extends BaseController {

  @Inject()
  userMembershipService: UserMembershipService;

  /**
   * 给用户充值套餐
   */
  @Post('/rechargePackage')
  async rechargePackage(
    @Body('userId') userId: number,
    @Body('packageId') packageId: number,
  ) {
    await this.userMembershipService.paySuccess(userId, packageId)
    return this.ok()
  }

}
