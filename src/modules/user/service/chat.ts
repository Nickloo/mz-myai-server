import { Inject, Provide } from '@midwayjs/decorator';
import { BaseException, BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { UserInfoEntity } from '../entity/info';
import { ModelEntity } from '../../model/entity/model';
import { UserMembershipService } from './membership';
// import Decimal from 'decimal.js';

/**
 * 描述
 */
@Provide()
export class UserChatService extends BaseService {

  @Inject()
  ctx: any

  @InjectEntityModel(UserInfoEntity)
  userEntity: Repository<UserInfoEntity>;

  @InjectEntityModel(ModelEntity)
  modelEntity: Repository<ModelEntity>;

  @Inject()
  userMembershipService: UserMembershipService

  /**
   * 检查聊天额度
   * 检查用户是否有电量使用当前模型
   */
  async checkChatQuota(userId: number, modelId: number) {
    const userInfo = await this.userEntity.findOneBy({ id: userId })
    // 当前模型的消耗值
    const modelInfo = await this.modelEntity.findOneBy({ id: modelId })
    if (!modelInfo) {
      throw new CoolCommException('模型不存在')
    }
    if (userInfo.dianliang < modelInfo.dianliang) {
      throw new BaseException('NO_DL', 10011, '电量不足')
    }
  }

}
