import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 权益表
 */
@Entity('membership_benefit')
export class MembershipBenefitEntity extends BaseEntity {

  @Column({ comment: '权益名称', length: 32 })
  name: string

  @Column({ comment: '权益描述', length: 255, nullable: true })
  desc: string

  @Column({ comment: '权益图标', length: 500, nullable: true })
  icon: string

  @Column({ comment: '奖励货币值', type: 'int', default: 0 })
  benefitValue: number

  @Column({ comment: '权益类型 1-货币奖励 2-纯文本 3-权限 9-其他', type: 'tinyint', default: 1 })
  benefitType: number

  @Column({ comment: '权益key', length: 32 })
  key: string

  // @Column({ comment: '权益状态 0-关闭 1-开启', type: 'tinyint', default: 1 })
  // status: number

  @Column({ comment: '排序', default: 10 })
  sort: number

  @Column({ comment: '权益值，方便扩展,存obj', type: 'json', nullable: true })
  benefitObj: object

  // 关系
  
}
