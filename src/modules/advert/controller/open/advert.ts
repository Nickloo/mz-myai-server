import { Get, Inject, Query } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { AdvertEntity } from '../../entity/advert';
import { AdvertService } from '../../service/advert';

/**
 * 描述
 */
@CoolController({
  api: ['info'],
  entity: AdvertEntity,
})
export class OpenAdvertController extends BaseController {
  @Inject()
  service: AdvertService;

  @Get('/infoByNo', { summary: '获取广告详情' })
  async infoByNo(@Query('no') no: string) {
    const data = await this.service.infoByNo(no);
    return this.ok(data);
  }

  @Get('/infoByKey', { summary: '获取广告详情' })
  async infoByKey(@Query('key') key: string) {
    const data = await this.service.infoByKey(key);
    return this.ok(data);
  }
}
