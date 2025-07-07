import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Between, Repository } from 'typeorm';
import { MessageEntity } from '../../dialog/entity/message';
import moment from 'moment';

/**
 * 描述
 */
@Provide()
export class MessageDataService extends BaseService {
  @InjectEntityModel(MessageEntity)
  messageEntity: Repository<MessageEntity>;

  /**
   * 获取使用统计
   */
  async getUseCount(
    params: { startDate?: any; endDate?: any; appType?: number } = {}
  ) {
    let where: any = {};

    if (params.startDate && params.endDate) {
      where.createTime = Between(params.startDate, params.endDate);
    }

    delete params.startDate;
    delete params.endDate;
    let count = await this.messageEntity.count({
      where: {
        ...where,
        ...params,
        senderType: 2,
      },
    });

    return count;
  }

  /**
   * 获取今日使用统计
   */
  async getTodayUseCount() {
    let todayDate = moment().format('YYYY-MM-DD');
    let startDate = moment(todayDate)
      .startOf('day')
      .format('YYYY-MM-DD HH:mm:ss');

    let endDate = moment(todayDate).endOf('day').format('YYYY-MM-DD HH:mm:ss');

    let totalCount = await this.getUseCount({ startDate, endDate });
    let chatCount = await this.getUseCount({
      startDate: startDate,
      endDate: endDate,
      appType: 1,
    });

    let writeCount = await this.getUseCount({
      startDate: startDate,
      endDate: endDate,
      appType: 2,
    });

    return {
      totalCount,
      chatCount,
      writeCount,
    };
  }
}
