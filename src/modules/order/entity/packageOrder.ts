import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 套餐订单表
 */
@Entity('package_order')
export class PackageOrderEntity extends BaseEntity {
  @Column({ comment: '订单号' })
  orderNo: string;

  @Column({ comment: '用户ID' })
  userId: number;

  @Column({ comment: '套餐ID' })
  packageId: number;

  @Column({ comment: '套餐名称' })
  packageName: string;

  @Column({ comment: '订单状态 0-待支付 1-已支付 9-已取消', default: 0 })
  status: number;

  @Column({ comment: '订单金额（元）', type: 'decimal', precision: 8, scale: 2 })
  amount: number;

  // @Column({ comment: '优惠金额（元）', type: 'decimal', precision: 8, scale: 2 })
  // discountAmount: number;

  // @Column({ comment: '实际支付金额（元）', type: 'decimal', precision: 8, scale: 2 })
  // payAmount: number;

  @Column({ comment: '支付时间', nullable: true })
  payTime: Date;

  @Column({ comment: '支付方式 1-微信支付 2-支付宝支付 3-余额支付', nullable: true })
  payWay: number;
}
