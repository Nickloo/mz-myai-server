import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 大模型表
 */
@Entity('model')
export class ModelEntity extends BaseEntity {
  
  @Column({ comment: '模型名称', length: 32})
  name: string;

  @Column({ comment: '前端展示名称', length: 32, nullable: true })
  showName: string;

  @Column({ comment: '模型描述', length: 255, nullable: true })
  description: string;

  @Column({ comment: '模型图标', type: 'text', nullable: true })
  icon: string;

  @Column({ comment: '模型供应商 openai、tongyi等', length: 32, nullable: true })
  provider: string;

  @Column({ comment: '模型类型 1-文本 2-语音 3-绘画', type: 'tinyint'  })
  type: number;

  @Column({ comment: '模型KEY', length: 255, unique: true })
  key: string;

  @Column({ comment: '每次调用消耗电量', type: 'int' })
  dianliang: number;

  @Column({ comment: '模型状态 0-关闭 1-开启', default: 0 })
  status: number;

  @Column({ comment: '排序', default: 10 })
  sort: number;

}
