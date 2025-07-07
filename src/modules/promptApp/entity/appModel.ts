import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PromptAppDifyEntity } from './appDify';

/**
 * 应用-模型关联表
 */
@Entity('prompt_app_dify_model')
export class PromptAppDifyModelEntity extends BaseEntity {
  @Column({ comment: '应用ID' })
  promptAppId: number;

  @Column({ comment: '分类ID' })
  modelId: number;
}
