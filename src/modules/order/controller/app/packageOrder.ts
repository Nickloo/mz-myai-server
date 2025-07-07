import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Inject, Post } from '@midwayjs/core';
import { PackageOrderService } from '../../service/packageOrder';
import { Validate } from '@midwayjs/validate';
import { PackageOrderDTO } from '../../dto/order';
import { Context } from '@midwayjs/koa';

/**
 * 套餐订单Controller
 */
@CoolController()
export class AppPackageOrderController extends BaseController {

  @Inject()
  orderService: PackageOrderService;

  @Inject()
  ctx: Context;

  /**
   * 创建订单并获取支付参数
   * 临时order表
   */
  @Validate()
  @Post('/tmpOrderAndPay', { summary: '创建订单并获取支付参数' })
  async createTmpOrderAndPay(@Body() body: PackageOrderDTO) {
    const res = await this.orderService.createTmpOrderAndPay(body);
    return this.ok(res);
  }

  @Post('/tmpOrderPayStatus')
  async getOrderPayStatus(@Body('orderNo') orderNo: string) {
    const userId = this.ctx.user.id;
    const res = await this.orderService.getOrderPayStatus(orderNo, userId);
    return this.ok(res);
  }
}
