import { CoolController, BaseController } from '@cool-midway/core';
import { UserInfoEntity } from '../../../user/entity/info';
import { Get, Inject, Query } from '@midwayjs/core';
import { AppUserDataService } from '../../service/appUser';
import { OrderDataService } from '../../service/order';
import { MessageDataService } from '../../service/message';

/**
 * 数据统计
 */
@CoolController({
  api: [],
  entity: UserInfoEntity,
})
export class DataAdminController extends BaseController {
  @Inject()
  appUserDataService: AppUserDataService;

  @Inject()
  orderDataService: OrderDataService;

  @Inject()
  messageDataService: MessageDataService;

  @Get('/data')
  async getHomeData() {
    let totalUser = await this.appUserDataService.getUserCount();
    let yesterday = await this.appUserDataService.getYesterdayCount();
    let today = await this.appUserDataService.getTodayCount();

    let orderPayTotalCount = await this.orderDataService.getPayCount();
    let orderYesterdayCount = await this.orderDataService.getYesterdayCount();
    let orderTodayCount = await this.orderDataService.getTodayCount();

    let orderAmount = await this.orderDataService.getOrderAmount();

    let useCount = await this.messageDataService.getTodayUseCount();
    return this.ok({
      userCount: {
        total: totalUser,
        yesterday: yesterday,
        today: today,
      },
      orderCount: {
        totalPay: orderPayTotalCount,
        todayPay: orderTodayCount,
        yesterdayPay: orderYesterdayCount,
      },
      orderAmount: {
        total: orderAmount?.amount || 0,
      },
      useCount: useCount,
    });
  }

  @Get('/user')
  async getUserData() {
    let totalUser = await this.appUserDataService.getUserCount();
    let yesterday = await this.appUserDataService.getYesterdayCount();
    let today = await this.appUserDataService.getTodayCount();
    return this.ok({
      total: totalUser,
      yesterday: yesterday,
      today: today,
    });
  }

  @Get('/pay')
  async getOrderPayData() {
    let orderPayTotalCount = await this.orderDataService.getPayCount();
    let orderYesterdayCount = await this.orderDataService.getYesterdayCount();
    let orderTodayCount = await this.orderDataService.getTodayCount();
    return this.ok({
      totalPay: orderPayTotalCount,
      todayPay: orderTodayCount,
      yesterdayPay: orderYesterdayCount,
    });
  }

  @Get('/amount')
  async getOrderAmountData() {
    let total = await this.orderDataService.getOrderAmount();
    return this.ok({
      total,
    });
  }
}
