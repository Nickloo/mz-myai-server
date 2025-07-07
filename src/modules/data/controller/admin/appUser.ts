import { CoolController, BaseController } from '@cool-midway/core';
import { UserInfoEntity } from '../../../user/entity/info';
import { Get, Inject, Query } from '@midwayjs/core';
import { AppUserDataService } from '../../service/appUser';

/**
 * 数据统计
 */
@CoolController({
  api: [],
  entity: UserInfoEntity,
})
export class AppUserDataAdminController extends BaseController {
  @Inject()
  appUserDataService: AppUserDataService;

  @Get('/getUserCountByDate')
  async getUserCountByDate(
    @Query('startDate') startDate,
    @Query('endDate') endDate
  ) {
    let count = await this.appUserDataService.getUserCountByDate(
      startDate,
      endDate
    );
    return this.ok(count);
  }
}
