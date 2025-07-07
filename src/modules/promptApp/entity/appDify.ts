// import { BaseEntity } from '@cool-midway/core';
import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * promptApp模块-Dify版本的应用信息
 */
@Entity('prompt_app_dify')
export class PromptAppDifyEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ comment: 'dify应用ID', length: 50, nullable: true })
  difyAppId: string;

  @Column({ comment: '应用名称', length: 50 })
  name: string;

  @Column({ comment: '应用类型 1-聊天 2-文本生成', default: 1 })
  type: number;

  @Column({
    comment: '模型类型 1-文本 2-语音 3-绘画',
    type: 'tinyint',
    default: 1,
  })
  modelType: number;

  @Column({ comment: '应用图标', length: 255, nullable: true })
  icon: string;

  @Column({ comment: '应用描述', length: 255, nullable: true })
  description: string;

  @Column({ comment: '前置提示词', length: 2000, nullable: true })
  prePrompt: string;

  @Column({ comment: 'API密钥', length: 50 })
  appSecret: string;

  @Column({ comment: '状态 0-关闭 1-启用', default: 0 })
  status: number;

  @Column({ comment: '是否是默认chat 0-否 1-是', default: 0 })
  isDefault: number;

  @Column({ comment: '是否推荐 0-否 1-是', default: 0 })
  isRecommend: number;

  @Column({ comment: '开场白', length: 2000, nullable: true })
  openingStatement: string;

  @Index()
  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @Index()
  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;
}
