import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Between, Repository } from 'typeorm';
import { UserInfoEntity } from '../../user/entity/info';
import moment from 'moment';

/**
 * 描述
 */
@Provide()
export class AppUserDataService extends BaseService {
  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  /**
   * 描述
   */
  async getUserCount() {
    let res = await this.userInfoEntity.count();
    return res;
  }

  async getUserCountByDate(startDate: any, endDate: any) {
    let res = await this.userInfoEntity.count({
      where: {
        createTime: Between(startDate, endDate),
      },
    });
    return res;
  }

  /**
   * 获取昨日注册量
   */
  async getYesterdayCount() {
    let yesterdayDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
    let count = await this.getUserCountByDate(
      yesterdayDate + ' 00:00:00',
      yesterdayDate + ' 23:59:59'
    );
    return count;
  }

  /**
   * 获取今日注册量
   */
  async getTodayCount() {
    let todayDate = moment().format('YYYY-MM-DD');
    let count = await this.getUserCountByDate(
      todayDate + ' 00:00:00',
      todayDate + ' 23:59:59'
    );
    return count;
  }
}
