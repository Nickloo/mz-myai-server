import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';
// import { DialogEntity } from './dialog';

/**
 * 聊天信息表
 */
@Entity('message')
export class MessageEntity extends BaseEntity {
  @Column({ comment: '内容', type: 'text' })
  content: string;

  @Column({ comment: '用户id，围绕某个用户展开的对话' })
  userId: number;

  @Column({ comment: '发送者id null是系统发出', nullable: true })
  senderId: number;

  @Column({ comment: '发送者类型 1-user 2-bot', default: 1 })
  senderType: number;

  // @Column({ comment: '接收者id' })
  // toId: number;

  @Column({ comment: '对话id', nullable: true })
  dialogId: string;

  @Column({ comment: '消息类型 1-text 2-image 3-video 4-audio 5-file', default: 1 })
  type: number;

  @Column({ comment: 'app类型 1-chat-message(聊天) 2-completion-messages(文本补全)', default: 1 })
  appType: number;

  @Column({ comment: '应用的id', nullable: true })
  appId: string;

  @Column({ comment: '模型名称', nullable: true })
  modelName: string;

  @Column({ comment: '消息状态 1-正常 2-撤回', default: 1 })
  status: number;

  @Column({ comment: '消耗电量', default: 0, nullable: true })
  dianliang: number;
  // @ManyToOne(() => DialogEntity, dialog => dialog.messages)
  // dialog: DialogEntity;

}
