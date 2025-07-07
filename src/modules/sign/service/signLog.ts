import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { SignEntity } from '../entity/sign';
import { SignLogEntity } from '../entity/signLog';
import moment from 'moment';
import { SignService } from './sign';
import { UserInfoService } from '../../user/service/info';
import { DIANLIANG_GET_TYPE } from '../../../comm/types';
import { UserSignEntity } from '../../user/entity/sign';
/**
 * 描述
 */
@Provide()
export class SignLogService extends BaseService {
  @InjectEntityModel(SignEntity)
  signEntity: Repository<SignEntity>;

  @InjectEntityModel(SignLogEntity)
  signLogEntity: Repository<SignLogEntity>;

  @InjectEntityModel(UserSignEntity)
  userSignEntity: Repository<UserSignEntity>;

  @Inject()
  signService: SignService;

  @Inject()
  userInfoService: UserInfoService;

  async userSign(userId: any) {
    const { todaySignLog, yesterdaySignLog } = await this.getUserSignLog(
      userId
    );

    if (todaySignLog) {
      throw new Error('今日已签到');
    }

    let signConfigIndex = 0;
    let signList = await this.signService.getSignList();
    // 判断用户昨天是否签到，如果有，则连续签到
    if (yesterdaySignLog && yesterdaySignLog.signId) {
      let yesSignIndex = signList.findIndex(
        v => v.id == yesterdaySignLog.signId
      );

      signConfigIndex =
        yesSignIndex == signList.length - 1 ? 0 : yesSignIndex + 1;
    }

    let signConf = signList[signConfigIndex];
    await this.signLogEntity.save({ userId, signId: signConf.id });
    // 添加奖励
    await this.userInfoService.addUserDianliang(
      userId,
      signConf.award,
      '电量到账',
      DIANLIANG_GET_TYPE.SIGN
    );

    let userSign = await this.userSignEntity.findOne({
      where: { userId },
    });

    // 保存签到次数
    if (!userSign) {
      this.userSignEntity.save({
        userId,
        signNum: 1,
        signTotalNum: 1,
      });
    } else {
      userSign.signNum = signConfigIndex + 1;
      userSign.signTotalNum++;
      userSign.save();
    }
  }

  async getUserSignLog(userId: any) {
    // 检查今天是否签到
    const todayDate = moment().format('YYYY-MM-DD');
    const todaySignLog = await this.signLogEntity
      .createQueryBuilder('signLog')
      .select('signId')
      .where('userId = :userId', { userId })
      .andWhere('DATE(createTime) = :todayDate', { todayDate })
      .getRawOne();

    // 获取用户昨日的签到记录
    const yesterdaySignLog = await this.signLogEntity
      .createQueryBuilder('signLog')
      .select('signId')
      .where('userId = :userId', { userId })
      .andWhere('DATE(createTime) = :todayDate', {
        todayDate: moment().subtract(1, 'days').format('YYYY-MM-DD'),
      })
      .getRawOne();

    return {
      todaySignLog: todaySignLog,
      yesterdaySignLog: yesterdaySignLog,
    };
  }
}
