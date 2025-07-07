import { Provide } from '@midwayjs/decorator'
import { BaseService } from '@cool-midway/core'
import { InjectEntityModel } from '@midwayjs/typeorm'
import { Repository } from 'typeorm'
import { AgreementEntity } from '../entity/agreement'

/**
 * 描述
 */
@Provide()
export class AgreementService extends BaseService {
  @InjectEntityModel(AgreementEntity)
  agreementEntity: Repository<AgreementEntity>

  /**
   * 描述
   */
  async infoByKey(key) {
    return await this.agreementEntity.findOne({ where: { key } })
  }
}
