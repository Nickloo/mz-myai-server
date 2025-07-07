import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 支付流水表
 */
@Entity('pay')
export class PayEntity extends BaseEntity {
  @Column({ comment: '订单ID' })
  orderId: number;

  @Column({ comment: '用户ID' })
  userId: number;

  @Column({ comment: '支付方式 1-微信支付 2-支付宝支付 3-余额支付' })
  payWay: number;

  @Column({ comment: '支付金额（元）', type: 'decimal', precision: 8, scale: 2 })
  amount: number;

  @Column({ comment: '支付时间' })
  payTime: Date;

  @Column({ comment: '支付状态 1-已支付 9-已退款' })
  status: number;

  @Column({ comment: '支付流水号', unique: true })
  payNo: string;

  @Column({ comment: '服务商交易编号', nullable: true, unique: true })
  merchantTransactionId: string;

}

