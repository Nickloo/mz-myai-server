import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, OneToMany } from 'typeorm';
import { LevelBenefitEntity } from './levelBenefit';

/**
 * 会员等级
 */
@Entity('membership_level')
export class MembershipLevelEntity extends BaseEntity {

  @Column({ comment: '会员等级名称', length: 32 })
  name: string

  @Column({ comment: '会员等级描述', length: 255, nullable: true })
  desc: string

  @Column({ comment: '会员等级图标', length: 500, nullable: true })
  icon: string

  @Column({ comment: '会员等级排序', default: 10 })
  sort: number

  @Column({ comment: '会员等级状态 0-关闭 1-开启', type: 'tinyint', default: 1 })
  status: number

  @OneToMany(() => LevelBenefitEntity, benefit => benefit.level)
  // @JoinTable() 写这个会自动维护中间表
  benefits: LevelBenefitEntity[];
}
