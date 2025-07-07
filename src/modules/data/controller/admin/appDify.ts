import { CoolController, BaseController } from '@cool-midway/core';
import { UserInfoEntity } from '../../../user/entity/info';
import { ALL, Get, Inject, Query } from '@midwayjs/core';
import { AppDifyDataService } from '../../service/appDify';

/**
 * 数据统计
 */
@CoolController({
  api: [],
  entity: UserInfoEntity,
})
export class AppDifyDataAdminController extends BaseController {
  @Inject()
  appDifyDataService: AppDifyDataService;

  @Get('/getUseCountRank')
  async getUseCountRank(@Query(ALL) query) {
    let rankList = await this.appDifyDataService.getUseCountRank(query);
    return this.ok(rankList);
  }
}
