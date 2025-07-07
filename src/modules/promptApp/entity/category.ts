import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * app应用分类
 */
@Entity('category')
export class CategoryEntity extends BaseEntity {
  @Column({ comment: '分类名称', length: 50 })
  name: string;

  @Column({ comment: '父级分类ID', nullable: true })
  parentId: number;

  @Column({ comment: '分类图标', length: 255, nullable: true })
  icon: string;

  @Column({ comment: '分类描述', length: 255, nullable: true })
  description: string;

  @Column({ comment: '分类类型 0-根节点 1-应用分类 2-行业分类'})
  type: number;

  @Column({ comment: '节点层级', default: 1 })
  level: number;

  @Column({ comment: '排序', default: 10 })
  sort: number;

  @Column({ comment: '是否展示 0-否 1-是', default: 1 })
  status: number

}
