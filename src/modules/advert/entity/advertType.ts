import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 广告类型
 */
@Entity('advert_type')
export class AdvertTypeEntity extends BaseEntity {
  @Column({ comment: '名称' })
  name: string;

  @Column({ comment: '配置', type: 'json', nullable: true })
  config: any;
}
