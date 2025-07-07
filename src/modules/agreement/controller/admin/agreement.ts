import { CoolController, BaseController } from '@cool-midway/core'
import { AgreementEntity } from '../../entity/agreement'

/**
 * 描述
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: AgreementEntity,
})
export class AdminAgreementController extends BaseController {}
