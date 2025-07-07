import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 签到记录
 */
@Entity('sign_log')
export class SignLogEntity extends BaseEntity {
  @Column({ comment: '用户id' })
  userId: number;

  @Column({ comment: '签到配置id' })
  signId: number;
}
