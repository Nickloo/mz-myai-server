import { CoolController, BaseController, BaseService } from '@cool-midway/core'
import { AgreementEntity } from '../../entity/agreement'
import { Get, Inject, Query } from '@midwayjs/core'
import { AgreementService } from '../../service/agreement'

/**
 * 描述
 */
@CoolController({
  api: ['info', 'list', 'page'],
  entity: AgreementEntity,
})
export class CommAgreementController extends BaseController {
  @Inject()
  service: AgreementService

  @Get('/infoByKey')
  async getInfoByKey(@Query('key') key: any) {
    const data = await this.service.infoByKey(key)
    return this.ok(data)
  }
}
