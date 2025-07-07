import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { AwardConfigEntity } from '../entity/config';
import { UserInfoService } from '../../user/service/info';
import { DIANLIANG_GET_TYPE } from '../../../comm/types';

/**
 * 奖励
 */
@Provide()
export class AwardService extends BaseService {

  @InjectEntityModel(AwardConfigEntity)
  awardConfigEntity: Repository<AwardConfigEntity>;

  @Inject()
  userService: UserInfoService

  /**
   * 新用户注册奖励
   * 奖励电量
   */
  async rewardNewUser(userId: number) {
    const awardConfig = await this.awardConfigEntity.findOneBy({ status: 1 })
    if (!awardConfig) {
      return 
    }
    const { newRegisterReward } = awardConfig
    if (newRegisterReward <= 0) {
      return 
    }
    // 奖励电量
    await this.userService.addUserDianliang(userId, newRegisterReward, '新用户注册奖励', DIANLIANG_GET_TYPE.REGISTER)
  }
}