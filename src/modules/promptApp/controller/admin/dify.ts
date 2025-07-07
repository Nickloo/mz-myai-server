import { ALL, Body, Inject, Post, Provide, Query } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { PromptAppDifyEntity } from '../../entity/appDify';
import { PromptDifyService } from '../../service/dify';

/**
 * promptApp - 应用管理
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: PromptAppDifyEntity,
  pageQueryOp: {
    keyWordLikeFields: ['name', 'description'],
    fieldEq: ['type', 'modelType', 'status', 'isRecommend'],
  },
})
export class AdminPromptAppDifysController extends BaseController {
  @Inject()
  difyService: PromptDifyService;
  /**
   * 添加
   */
  @Post('/syncAppFromOther')
  async syncAppFromOther(@Query() params: any) {
    console.log('params', params);
    let data = await this.difyService.syncAppFromOther(params);
    return this.ok(data);
  }

  /**
   * 添加
   */
  @Post('/getAppListFromOther')
  async getAppFromOther(@Body(ALL) params: any) {
    let list = await this.difyService.getAppFromOther(params);
    return this.ok(list);
  }

  @Post('/addList')
  async addList(
    @Body('list') list: any,
    @Body('difyToken') difyToken: string,
    @Body('difyBaseUrl') difyBaseUrl: string
  ) {
    let data = await this.difyService.addList(list, difyToken, difyBaseUrl);
    return this.ok(data);
  }

  @Post('/proxyDify')
  async proxyDify(
    @Body(ALL)
    options: {
      token: string;
      method: string;
      headers?: any;
      url: string;
      data?: any;
      params?: any;
    }
  ) {
    let data = await this.difyService.proxy(options);
    return this.ok(data);
  }
}
