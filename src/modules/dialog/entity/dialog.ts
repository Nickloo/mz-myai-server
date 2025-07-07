import { Entity, Column, PrimaryColumn, BaseEntity, Index, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
// import { MessageEntity } from './message';

// 单聊（后面群里再建一个表）
@Entity('dialog')
export class DialogEntity extends BaseEntity {

  @PrimaryColumn({ comment: '对话id，uuid格式', type: 'varchar', length: 36 })
  id: string;

  @Column({ comment: '对话标题', length: 50, default: '新建对话' })
  title: string;

  @Column({ comment: '对话icon图标', length: 255, nullable: true })
  icon: string

  @Column({ comment: '对话类型 1-systemChat（默认聊天） 2-助手 3-虚拟角色', default: 1 })
  type: number;

  @Column({ nullable: false })
  userId: number;

  @Column({ comment: '应用id', nullable: true })
  appId: string;

  @Column({ comment: '最新一条message', length: 50, nullable: true })
  lastestMessage: string

  @Index()
  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @Index()
  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;

  // @OneToMany(() => MessageEntity, message => message.dialog, { cascade: true })
  // messages: MessageEntity[];

}