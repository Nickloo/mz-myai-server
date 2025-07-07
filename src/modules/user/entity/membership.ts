import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserInfoEntity } from './info';

/**
 * 用户会员信息表
 * 一个用户可对应多个会员等级
 */
@Entity('user_membership')
export class UserMembershipEntity extends BaseEntity {
  @Column({ comment: '用户id' })
  userId: number;

  @Column({ comment: '会员等级id' })
  membershipLevelId: number;

  @Column({ comment: '会员等级名称' })
  name: string;

  @Column({ comment: '图标', nullable: true })
  icon: string;

  @Column({ comment: '首次开会员时间' })
  firstStartTime: Date;

  @Column({ comment: '开始时间' })
  startTime: Date;

  @Column({ comment: '会员结束时间' })
  endTime: Date;

  @Column({ comment: '状态 1-正常 2-已过期', default: 1 })
  status: number;

  @ManyToOne(() => UserInfoEntity)
  @JoinColumn({ name: 'userId' })
  userInfo: UserInfoEntity;
}
