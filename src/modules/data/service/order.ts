import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Between, Repository } from 'typeorm';
import { PackageOrderEntity } from '../../order/entity/packageOrder';
import moment from 'moment';

/**
 * 描述
 */
@Provide()
export class OrderDataService extends BaseService {
  @InjectEntityModel(PackageOrderEntity)
  packageOrderEntity: Repository<PackageOrderEntity>;

  /**
   * 获取支付订单数量
   * @param startDate 开始时间
   * @param endDate 结束时间
   */
  async getPayCount(
    params: { startDate?: any; endDate?: any; status?: number } = {}
  ) {
    let where = {};
    if (params.startDate && params.endDate) {
      where = {
        payTime: Between(params.startDate, params.endDate),
      };
    }
    delete params.startDate;
    delete params.endDate;

    let count = await this.packageOrderEntity.count({
      where: {
        status: params.status || 1,
        ...where,
        ...params,
      },
    });
    return count;
  }

  /**
   * 获取昨日注册量
   */
  async getYesterdayCount() {
    let yesterdayDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
    let count = await this.getPayCount({
      startDate: yesterdayDate + ' 00:00:00',
      endDate: yesterdayDate + ' 23:59:59',
    });
    return count;
  }

  /**
   * 获取今日注册量
   */
  async getTodayCount() {
    let todayDate = moment().format('YYYY-MM-DD');
    let count = await this.getPayCount({
      startDate: todayDate + ' 00:00:00',
      endDate: todayDate + ' 23:59:59',
    });
    return count;
  }

  /**
   * 获取订单金额
   */
  async getOrderAmount(
    params: { startDate?: any; endDate?: any; status?: number } = {}
  ) {
    let builder = this.packageOrderEntity.createQueryBuilder('order');
    builder.select(['SUM(order.amount) as amount']);
    builder.where('order.status = 1');
    return await builder.getRawOne();
  }
}
