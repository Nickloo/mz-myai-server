import { Inject, Post } from '@midwayjs/decorator';
import { CoolController, BaseController } from '@cool-midway/core';
import { CoolEventManager } from '../../../../types/event';

/**
 * 事件
 */
@CoolController()
export class AppDemoEventController extends BaseController {
  @Inject()
  coolEventManager: CoolEventManager;

  @Post('/send')
  async send() {
    await this.coolEventManager.emit('demo', { a: 1 }, 1);
    return this.ok();
  }
}
