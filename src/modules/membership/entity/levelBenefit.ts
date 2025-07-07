import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, ManyToOne } from 'typeorm';
import { MembershipLevelEntity } from './membershipLevel';
import { MembershipBenefitEntity } from './membershipBenefit';

@Entity('level_benefit')
export class LevelBenefitEntity extends BaseEntity {

  @Column({ comment: '状态 0-禁用 1-启用', default: 1 })
  status: number;

  @ManyToOne(() => MembershipLevelEntity, level => level.benefits)
  level: MembershipLevelEntity;

  @ManyToOne(() => MembershipBenefitEntity)
  benefit: MembershipBenefitEntity;

  @Column({ comment: '会员等级Id' })
  levelId: number;

  @Column({ comment: '权益Id' })
  benefitId: number;
}