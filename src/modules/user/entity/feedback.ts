import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, Index } from 'typeorm';

/**
 * user模块-意见反馈
 */
@Entity('feedback')
export class FeedbackEntity extends BaseEntity {
  @Column({ comment: 'userId' })
  userId: number;

  @Column({ comment: '邮箱', length: 50, nullable: true })
  email: string;

  @Column({ comment: '电话', length: 11, nullable: true })
  phone: string;

  @Column({ comment: '微信号', length: 50, nullable: true })
  wechat: string;

  @Column({ comment: '反馈类型 1-功能异常 2-意见与建议' })
  type: number;

  @Column({ comment: '反馈内容', type: 'text' })
  content: string;

  @Column({ comment: '状态 0-未处理 1-已处理', type: 'tinyint', default: 0 })
  status: number;
}
