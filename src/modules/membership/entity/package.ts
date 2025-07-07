import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, ManyToOne } from 'typeorm';
import { MembershipLevelEntity } from './membershipLevel';

/**
 * Membership模块-会员套餐
 */
@Entity('membership_package')
export class MembershipPackageEntity extends BaseEntity {

  @Column({ comment: '套餐名称', length: 32 })
  name: string;

  @Column({ comment: '套餐描述', length: 255, nullable: true })
  desc: string;

  @Column({ comment: '会员等级ID' })
  levelId: number;

  @Column({ comment: '有效期（天）', type: 'integer' })
  expirationDay: number;

  @Column({ comment: '原价', type: 'decimal', precision: 8, scale: 2, nullable: true })
  originalPrice: number;

  @Column({ comment: '价格', type: 'decimal', precision: 8, scale: 2 })
  price: number;

  @Column({ comment: '备注(仅后台可见)', nullable: true })
  remark: string;

  @Column({ comment: '类型', type: 'tinyint', nullable: true })
  type: number;

  @Column({ comment: '图标', nullable: true })
  icon: string;

  @Column({ comment: '排序', default: 10 })
  sort: number;

  @Column({ comment: '状态 0-禁用 1-启用', default: 1 })
  status: number;

  // 会员等级关联
  @ManyToOne(() => MembershipLevelEntity)
  level: MembershipLevelEntity;

}
