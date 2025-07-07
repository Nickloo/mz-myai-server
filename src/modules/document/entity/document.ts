import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 文档
 */
@Entity('document')
export class DocumentEntity extends BaseEntity {
  @Column({ comment: '标题', length: 100 })
  title: string;

  @Column({ comment: '内容', type: 'text' })
  content: string;

  @Column({ comment: '键值', nullable: true })
  key: string;

  @Column({ comment: '状态 1-启用 0-停用', default: 1 })
  status: number;

  @Column({ comment: '分类id', nullable: true })
  categoryId: number;

  @Column({ comment: '排序', default: 0 })
  sort: number;
}
