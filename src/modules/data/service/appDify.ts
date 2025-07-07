import { Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Between, Repository } from 'typeorm';
import { UserInfoEntity } from '../../user/entity/info';
import moment from 'moment';
import { PromptAppDifyEntity } from '../../promptApp/entity/appDify';
import { MessageEntity } from '../../dialog/entity/message';

/**
 * 描述
 */
@Provide()
export class AppDifyDataService extends BaseService {
  @InjectEntityModel(PromptAppDifyEntity)
  promptAppDifyEntity: Repository<PromptAppDifyEntity>;

  @InjectEntityModel(MessageEntity)
  messageEntity: Repository<MessageEntity>;

  /**
   * 获取使用次数排名
   * @param params { startDate: any; endDate: any; appType: number }
   */
  async getUseCountRank(params: {
    startDate?: any;
    endDate?: any;
    appType?: number;
  }) {
    let builder = this.messageEntity.createQueryBuilder('message');
    builder = builder
      .select('message.appId, appDify.name as appName')
      .addSelect('COUNT(message.id)', 'count')
      .leftJoin(PromptAppDifyEntity, 'appDify', 'message.appId = appDify.id')
      .where('message.status = :status', { status: 1 })
      .andWhere('message.senderType = 2')
      .groupBy('message.appId')
      .orderBy('count', 'DESC');

    if (params.appType) {
      builder.andWhere('message.appType = :appType', {
        appType: params.appType,
      });
    }

    if (params.startDate && params.endDate) {
      builder.andWhere('message.createTime BETWEEN :startDate AND :endDate', {
        startDate: params.startDate,
        endDate: params.endDate,
      });
    }

    return await builder.getRawMany();
  }
}
