import { BaseEntity } from '@cool-midway/core'
import { Column, Entity } from 'typeorm'

/**
 * 协议管理
 */
@Entity('agreement')
export class AgreementEntity extends BaseEntity {
  @Column({ comment: '标题', length: 100 })
  title: string

  @Column({ comment: '内容', type: 'text' })
  content: string

  @Column({ comment: '键值' })
  key: string

  @Column({ comment: '状态 1-启用 0-停用' })
  status: number
}
