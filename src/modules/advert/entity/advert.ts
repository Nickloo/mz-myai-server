import { BaseEntity } from '@cool-midway/core';
import { Column, Entity, Index } from 'typeorm';

/**
 * 广告
 */
@Entity('advert')
export class AdvertEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: '编号' })
  no: string;

  @Index({ unique: true })
  @Column({ comment: '键值', nullable: true })
  key: string;

  @Column({ comment: '名称' })
  name: string;

  @Column({
    comment: '类型 1-弹窗 2-底部 3-通用',
    default: 1,
  })
  type: number;

  @Column({ comment: '页面', nullable: true })
  pageId: number;

  @Column({ comment: '图片', nullable: true })
  img: string;

  @Column({ comment: '链接', nullable: true })
  link: string;

  @Column({ comment: '是否自动显示 1-是 0-否', default: 1 })
  autoShow: number;

  @Column({ comment: '倒计时多久展示s', nullable: true })
  countDownTime: number;

  @Column({ comment: '备注', nullable: true })
  remark: string;

  @Column({ comment: '配置', type: 'json', nullable: true })
  config: any;

  @Column({ comment: '状态 1-开启 0-关闭', default: 1 })
  status: number;
}
