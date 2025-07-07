import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 文档分类
 */
@Entity('document_category')
export class DocumentCategoryEntity extends BaseEntity {
  @Column({ comment: '分类名称', length: 100 })
  name: string;

  @Column({ comment: '排序', default: 0 })
  sort: number;

  @Column({ comment: '父级分类', nullable: true })
  parentId: number;

  @Column({ comment: '状态 1-启用 0-停用', default: 1 })
  status: number;
}
