import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { UserInfoEntity } from '../entity/info';
import { UserMembershipEntity } from '../entity/membership';
import { MembershipPackageEntity } from '../../membership/entity/package';
import { UserInfoService } from './info';
import { MembershipLevelService } from '../../membership/service/membershipLevel';
import * as bull from '@midwayjs/bull';

/**
 * 描述
 */
@Provide()
export class UserMembershipService extends BaseService {

  @InjectEntityModel(UserInfoEntity)
  userEntity: Repository<UserInfoEntity>;

  @InjectEntityModel(UserMembershipEntity)
  userMembershipEntity: Repository<UserMembershipEntity>;

  @InjectEntityModel(MembershipPackageEntity)
  packageEntity: Repository<MembershipPackageEntity>;

  @Inject()
  userService: UserInfoService;

  @Inject()
  levelService: MembershipLevelService;

  @Inject()
  bullFramework: bull.Framework;

  /**
   * 用户根据购买的套餐
   * 加入对应级别的会员
   */
  async joinMembership(userId: number, packageId: number) {
    // 1. 获取套餐对应的会员等级
    const packageInfo = await this.packageEntity.findOneBy({ id: packageId })
    if (!packageInfo) {
      throw new CoolCommException('套餐不存在')
    }
    const membershipLevelId = packageInfo.levelId
    // 1. 获取会员等级信息
    const membershipLevelInfo = await this.packageEntity.findOneBy({ id: membershipLevelId })
    if (!membershipLevelInfo) {
      throw new CoolCommException('会员等级不存在')
    }
    // 2. 获取用户信息
    const userInfo = await this.userEntity.findOneBy({ id: userId })
    if (!userInfo) {
      throw new CoolCommException('用户不存在')
    }
    // 3. 获取用户会员信息
    let userMembershipInfo = await this.userMembershipEntity.findOneBy({ userId })
    // 如果没有会员信息，直接新建一条
    if (!userMembershipInfo) {
      userMembershipInfo = await this.userMembershipEntity.save({
        userId,
        membershipLevelId,
        name: membershipLevelInfo.name,
        icon: membershipLevelInfo.icon,
        firstStartTime: new Date(),
        startTime: new Date(),
        endTime: new Date(new Date().getTime() + membershipLevelInfo.expirationDay * 24 * 60 * 60 * 1000),
      })
      // update userInfo membershipId
      // await this.userEntity.update({ id: userId }, { userMembershipId: userMembership.id })
    }
    // 已经是会员的情况（续费）
    else {
      // TODO 暂先处理同一等级的会员
      // 3.1 如果用户已经有会员信息，判断会员等级是否一致
      // if (userMembershipInfo.membershipLevelId == membershipLevelId) {
        // 3.1.1 如果一致，判断会员是否过期
        if (userMembershipInfo.status == 1) { // 未过期
          // 则延长会员时间
          userMembershipInfo.endTime = new Date(userMembershipInfo.endTime.getTime() + membershipLevelInfo.expirationDay * 24 * 60 * 60 * 1000)
        } else { // 已经过期了，在当前时间基础上延长
          userMembershipInfo.startTime = new Date()
          userMembershipInfo.endTime = new Date(new Date().getTime() + membershipLevelInfo.expirationDay * 24 * 60 * 60 * 1000)
          // 更新会员状态
          userMembershipInfo.status = 1
        }
        // update userMembership
        await this.userMembershipEntity.save(userMembershipInfo)
      // } else {
      //   // TODO 处理会员等级不一致的情况
      //   // 处理差价等
      // }
    }
    // update user isVip
    await this.userEntity.update({ id: userId }, { isVip: 1 })
    // 充值电量
    const dianliang = await this.levelService.sumDianliangByLevelId(membershipLevelId)
    await this.userService.addUserDianliang(userId, dianliang)
    return userMembershipInfo
  }

  /**
   * 支付成功后处理
   */
  async paySuccess(userId: number, packageId: number) {
    // 加入会员逻辑
    const userMembership = await this.joinMembership(userId, packageId)
    // 定时队列，停止用户会员
    await this.stopUserMembershipTask(userMembership.membershipLevelId, userId, userMembership.endTime)
  }

  /**
   * endTime自动关闭会员
   * 使用延迟队列
   */
  async stopUserMembershipTask(levelId: number, userId: number, endTime: Date) {
    const queue = this.bullFramework.getQueue('membership');
    // 延迟到endTime
    const delay = endTime.getTime() - new Date().getTime()
    // 运行job
    await queue?.runJob({ levelId, userId, action: 'stop' }, { delay });
  }

  /**
   * 停止用户某会员
   */
  async stopUserMembership(levelId: number, userId: number) {
    const membershipInfo = await this.userMembershipEntity.findOneBy({ userId, membershipLevelId: levelId })
    if (!membershipInfo) {
      throw new CoolCommException('会员不存在')
    }
    // 设置会员过期
    membershipInfo.status = 2
    await this.userMembershipEntity.save(membershipInfo)
    // 设置用户vip状态
    await this.userEntity.update({ id: userId }, { isVip: 0 })

  }

}
