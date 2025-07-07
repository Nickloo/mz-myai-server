import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, Index } from 'typeorm';

/**
 * 描述
 */
@Entity('config')
export class ConfigEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: '键值 invite-邀请 website-网站' })
  key: string;

  @Column({ comment: '配置', type: 'json' })
  data: any;
}
