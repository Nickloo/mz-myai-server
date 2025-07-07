import { CoolController, BaseController, BaseService } from '@cool-midway/core';
import { ConfigEntity } from '../../entity/config';
import { Get, Inject, Query } from '@midwayjs/core';
import { ConfigService } from '../../service/config';

/**
 * 描述
 */
@CoolController({
  api: [],
  entity: ConfigEntity,
})
export class OpenConfigController extends BaseController {

  @Inject()
  service: ConfigService;

  @Get('/getConfigByKey')
  async getConfigByKey(@Query('key') key: string) {
    let data = await this.service.getConfig(key);
    return this.ok(data);
  }
}
