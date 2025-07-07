import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 用户电量记录
 */
@Entity('user_dianliang_record')
export class UserDianliangEntity extends BaseEntity {

  @Column({ comment: '用户id' })
  userId: number;

  @Column({ comment: '电量' })
  dianliang: number;

  @Column({ comment: '类型 1-增加 2-减少', type: 'tinyint' })
  type: number;

  @Column({
    comment:
      '获得类型 1-会员 2-充值 3-签到 4-兑换 5-任务 6-活动 7-分成 8-新注册 9-邀请',
    type: 'tinyint',
    nullable: true,
  })
  getType: number;

  @Column({ comment: '备注', nullable: true })
  remark: string;

}
