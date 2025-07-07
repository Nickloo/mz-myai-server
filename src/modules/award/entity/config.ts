import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, Index } from 'typeorm';

/**
 * Award module - Reward configuration entity
 */
@Entity('award_config')
export class AwardConfigEntity extends BaseEntity {

  @Column({ comment: '新注册用户奖励（电量）', default: 0 })
  newRegisterReward: number;

  @Column({ comment: '其他配置', type: 'json', nullable: true })
  params: any;

  @Column({ comment: '状态 0-关闭 1-开启', default: 0 })
  status: number;
}
