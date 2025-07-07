import {
  CoolController,
  BaseController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { Body, Inject, Post } from '@midwayjs/core';
import { OrderPayService } from '../../service/pay';

/**
 * 支付
 */
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['wxNotify', 'aliNotify'],
})
@CoolController()
export class OpenOrderPayController extends BaseController {
  @Inject()
  orderPayService: OrderPayService;

  // @Post('/aliNotify', { summary: '支付宝支付回调通知' })
  // async aliNotify(@Body() body) {
  //   this.orderPayService.aliNotify(body);
  //   return 'success';
  // }

  // @Post('/aliQrcode', { summary: '支付宝扫码支付' })
  // async aliQrcode(
  //   @Body('orderId') orderId: number,
  //   @Body('width') width: number
  // ) {
  //   return this.ok(await this.orderPayService.aliQrcode(orderId, width));
  // }

  // @Post('/aliApp', { summary: '支付宝APP支付' })
  // async aliApp(@Body('orderId') orderId: number) {
  //   return this.ok(await this.orderPayService.aliApp(orderId));
  // }

  // @Post('/wxApp', { summary: '微信APP支付' })
  // async wxApp(@Body('orderId') orderId: number) {
  //   return this.ok(await this.orderPayService.wxApp(orderId));
  // }

  @Post('/wxNotify', { summary: '微信支付回调' })
  async wxNotify(@Body() body) {
    await this.orderPayService.wxNotify(body);
    return 'success';
  }

  @Post('/wxQrcode', { summary: '微信扫码支付' })
  async wxQrcode(@Body() body) {
    const res = await this.orderPayService.wxQrcode(body);
    return this.ok(res);
  }
}