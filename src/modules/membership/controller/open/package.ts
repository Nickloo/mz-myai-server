import { Get, Inject, Provide } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { MembershipPackageEntity } from '../../entity/package';
import { PackageService } from '../../service/package';

/**
 * 会员-包
 */
@Provide()
@CoolController({
  api: ['info', 'list', 'page'],
  entity: MembershipPackageEntity,
  // service: PackageService,
})
export class OpenMembershipPackagesController extends BaseController {

  @Inject()
  packageService: PackageService

  @Get('/allInfo')
  async allInfo() {
    const res = await this.packageService.allInfo()
    return this.ok(res)
  }
}
