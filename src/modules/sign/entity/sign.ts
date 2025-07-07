import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 签到
 */
@Entity('sign')
export class SignEntity extends BaseEntity {
  @Column({ comment: '排序', default: 0 })
  sort: number;

  @Column({ comment: '奖励' })
  award: number;

  @Column({ comment: '奖励类型 1-电量 2-其他' })
  awardType: number;

  @Column({ comment: '类型 1-连续签到 2-普通签到', default: 1 })
  type: number;
}
