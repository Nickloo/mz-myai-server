import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 用户的创作
 */
@Entity('user_creation')
export class UsreCreationEntity extends BaseEntity {
  @Column({ comment: 'userId' })
  userId: number;

  @Column({ comment: 'appId', length: 36 })
  appId: string;

  @Column({ comment: '标题', nullable: true })
  title: string;

  @Column({ comment: '内容', nullable: true, type: 'text' })
  content: string;

  @Column({ comment: '用户Inputs', type: 'json' })
  userInputs: string

  @Column({ comment: '系统原始回答', nullable: true, type: 'text' })
  answer: string
}
