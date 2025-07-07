import { CoolController, BaseController } from '@cool-midway/core';
import { SignLogEntity } from '../../entity/signLog';
import { Inject, Post } from '@midwayjs/core';
import { SignLogService } from '../../service/signLog';
import { Context } from '@midwayjs/koa';

/**
 * 描述
 */
@CoolController({
  api: [],
  entity: SignLogEntity,
})
export class AppSignLogController extends BaseController {
  @Inject()
  signLogService: SignLogService;

  @Inject()
  ctx: Context;

  /**
   * 签到
   */
  @Post('/sign', { summary: '签到' })
  async sign() {
    let userId = this.ctx.user.id;
    let res = await this.signLogService.userSign(userId);
    return this.ok();
  }

  /**
   * 签到记录
   */
  @Post('/signLog', { summary: '签到记录' })
  async signLog() {
    let userId = this.ctx.user.id;
    let res = await this.signLogService.getUserSignLog(userId);
    return this.ok(res);
  }
}
