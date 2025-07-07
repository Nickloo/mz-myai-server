import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PromptAppDifyEntity } from '../../promptApp/entity/appDify';

/**
 * 用户添加的app
 */
@Entity('user_apps')
export class UserAppsEntity extends BaseEntity {
  
  @Column({ comment: 'userId' })
  userId: number;

  @Column({ comment: 'appId' })
  appId: string;

  @Column({ comment: '最后一条消息概要', nullable: true, length: 50 })
  lastestMessage: string;

  @Column({ comment: '最后一次对话的id', nullable: true, length: 36 })
  lastestDialogId: string;

  @ManyToOne(() => PromptAppDifyEntity)
  @JoinColumn({ name: 'appId' })
  appInfo: PromptAppDifyEntity;

}
