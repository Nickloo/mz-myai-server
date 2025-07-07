import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 用户签到记录表 用户-签到 1对1表
 */
@Entity('user_sign')
export class UserSignEntity extends BaseEntity {
  @Column({ comment: '用户id' })
  userId: number;

  @Column({ comment: '连续签到次数', default: 0 })
  signNum: number;

  @Column({ comment: '总签到次数', default: 0 })
  signTotalNum: number;
}
