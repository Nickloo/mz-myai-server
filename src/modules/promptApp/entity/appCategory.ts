import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PromptAppDifyEntity } from './appDify';

/**
 * 分类-应用关联表
 */
@Entity('prompt_app_dify_category')
export class PromptAppDifyCategoryEntity extends BaseEntity {
  @Column({ comment: '应用ID' })
  promptAppId: number;

  @Column({ comment: '分类ID' })
  categoryId: number;

  @ManyToOne(() => PromptAppDifyEntity)
  @JoinColumn({ name: 'promptAppId' })
  promptApp: PromptAppDifyEntity;
}

