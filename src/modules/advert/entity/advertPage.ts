import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 广告页面
 */
@Entity('advert_page')
export class AdvertPageEntity extends BaseEntity {
  @Column({ comment: '名称' })
  name: string;
}
