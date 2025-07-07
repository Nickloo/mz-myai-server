import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserInfoEntity } from '../entity/info';
import { CoolFile } from '@cool-midway/file';
import { v1 as uuid } from 'uuid';
import { UserDianliangEntity } from '../entity/dianliang';
import { DIANLIANG_GET_TYPE } from '../../../comm/types';
import { UserLoginService } from './login';
import { CacheManager } from '@midwayjs/cache';
import { UserWxService } from './wx';
import { UserWxEntity } from '../entity/wx';
import { Context } from '@midwayjs/koa';
import { UserSmsService } from './sms';
import { ProfileDTO } from '../dto/profile';
import { UserSignEntity } from '../entity/sign';
import { ConfigService } from '../../config/service/config';
import { CONFIG_KEY } from '../../../comm/const';
import { UserInviteEntity } from '../entity/invite';

/**
 * 用户信息
 */
@Provide()
export class UserInfoService extends BaseService {

  @Inject()
  ctx: Context;

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @InjectEntityModel(UserDianliangEntity)
  userDianliangEntity: Repository<UserDianliangEntity>;

  @InjectEntityModel(UserWxEntity)
  userWxEntity: any;

  @InjectEntityModel(UserSignEntity)
  userSignEntity: Repository<UserSignEntity>;

  @InjectEntityModel(UserInviteEntity)
  userInviteEntity: Repository<UserInviteEntity>;

  @Inject()
  file: CoolFile;

  @Inject()
  userLoginService: UserLoginService

  @Inject()
  cacheManager: CacheManager

  @Inject()
  userWxService: UserWxService;

  @Inject()
  userSmsService: UserSmsService;

  @Inject()
  configService: ConfigService;

  /**
   * 获取用户信息
   * @param id
   * @returns
   */
  async person(id) {
    // 获取用户信息及关联的会员信息
    const info = await this.userInfoEntity.findOne({
      where: { id },
      relations: ['userMemberships'],
    });
    return info;
  }

  /**
   * 获取用户签到数据
   * @param userId
   */
  async getUserSignData(userId: any) {
    let data = await this.userSignEntity.findOne({ where: { userId } });
    if (data) {
      return data;
    } else {
      return await this.userSignEntity.save({
        userId,
      });
    }
  }

  async updatePerson(id, param: ProfileDTO) {
    try {
      return await this.userInfoEntity.update({ id }, param);
    } catch (err) {
      throw new CoolCommException('更新失败，参数错误或者手机号已存在');
    }
  }

  /**
   * 扣除用户电量
   * @param value 电量值
   */
  async deductUserDianliang(userId: number, value: number, remark = '聊天扣除') {
    // update 用户电量值 性能更好
    await this.userInfoEntity.update({ id: userId }, { dianliang: () => `dianliang - ${value}` })
    await this.userDianliangEntity.save({
      userId,
      dianliang: -value,
      type: 2,
      remark
    })
  }

  /**
   * 增加用户电量
   */
  async addUserDianliang(userId: number, value: number, remark = '电量到账', getType = DIANLIANG_GET_TYPE.MEMBERSHIP) {
    await this.userInfoEntity.update({ id: userId }, { dianliang: () => `dianliang + ${value}` })
    await this.userDianliangEntity.save({
      userId,
      dianliang: value,
      type: 1,
      getType,
      remark
    })
  }

  /**
   * 微信扫码绑定
   * @param id
   * @returns
   */
  async qrCodeBind(wxData: scanEventData) {
    let res = {
      code: 1000,
      message: '绑定成功',
    }
    const openid = wxData.FromUserName[0]
    const qrcodeData = this.userLoginService.paraseQrcodeData(
      wxData.EventKey[0]
    ) // 用户前端唯一标识
    const { uuid } = JSON.parse(qrcodeData)
    const userId = uuid
    // 获取用户unionid
    const { unionid } = await this.userWxService.getMpUserInfoByOpenid(openid)
    // 如果已经绑定过了，就不再绑定
    // const user = await this.userWxEntity.findOne({ where: { openid, userId } })
    const user = await this.userInfoEntity.findOne({
      where: { id: userId, unionid },
    })
    if (user) {
      res.code = 1001
      res.message = '请先解绑'
    } else {
      // 微信已绑定其他账号
      const userinfo = await this.userInfoEntity.findOne({ where: { unionid } })
      if (userinfo) {
        res.code = 1001
        res.message = '该微信已绑定其他账号'
      } else {
        // 一切正常再绑定
        await this.userWxEntity.insert({
          openid,
          unionid,
          userId,
          type: 1,
        })
        // 更新用户unionid
        await this.userInfoEntity.update({ id: userId }, { unionid })
      }
    }
    // 存到redis
    await this.cacheManager.set(`auth:qrbind:${uuid}`, res, {
      ttl: 60,
    })
  }

  // 解绑微信
  async unbindWx(id) {
    await this.userInfoEntity.update({ id }, { unionid: null })
    return '解绑成功'
  }

  /**
   * 获得用户微信绑定状况
   * 成功返回1000 失败返回1001
   * @param uuid
   */
  async getQrBindStatus(uuid: string) {
    const data: any = await this.cacheManager.get(`auth:qrbind:${uuid}`)
    // await this.cacheManager.del(`auth:qrbind:${uuid}`)
    if (!data) return '未绑定'
    if (data.code === 1001) throw new CoolCommException(data.message)
    // 清除缓存
    return 'ok'
  }

  async getUserInviteCode(userId: any) {
    let data = await this.userInfoEntity.findOne({ where: { id: userId } });
    if (data.inviteCode) {
      return data.inviteCode;
    } else {
      let inviteCode = this.generateInviteCode(userId);
      await this.userInfoEntity.update(
        { id: userId },
        { inviteCode: inviteCode }
      );
      return inviteCode;
    }
  }
  /**
   * 生成6位邀请码，无规律、唯一、不重复
   * @param userId 用户id
   */
  generateInviteCode(userId: any) {
    let id = userId;
    const PRIME1 = 31;
    const PRIME2 = 30;
    const SALT = 12345;
    const CODE_LENGTH = 7;
    const ARY = 36;
    const HEX_36_Array = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    id = id * PRIME1;
    id += SALT;

    let b = new Array(CODE_LENGTH);
    b[0] = id;

    for (let i = 0; i < 5; ++i) {
      b[i + 1] = Math.floor(b[i] / ARY);
      b[i] = (b[i] + b[0] * i) % ARY;
    }

    b[5] = ((b[0] + b[1] + b[2]) * PRIME1) % ARY;
    b[6] = ((b[3] + b[4] + b[5]) * PRIME1) % ARY;

    let sb = '';

    for (let i = 0; i < CODE_LENGTH; ++i) {
      sb += HEX_36_Array.charAt(b[(i * PRIME2) % CODE_LENGTH]);
    }

    return sb;
  }

  /**
   * 邀请奖励
   * @param inviteCode 邀请码
   * @param userId 注册的用户id
   */
  async inviteReward(inviteCode: string, userId: any) {
    let friend = await this.userInfoEntity.findOne({ where: { inviteCode } });
    if (!friend) return;

    let user = await this.userInfoEntity.findOne({ where: { id: userId } });
    user.friendId = friend.id;
    user.save();

    // 邀请奖励配置
    let inviteConfig: InviteConfig = (await this.configService.getConfig(
      CONFIG_KEY.INVITE
    )) as any;

    // 判断是否赠送给邀请人
    if (inviteConfig.rewardInviterValue > 0) {
      this.addUserDianliang(
        friend.id,
        inviteConfig.rewardInviterValue,
        '邀请好友奖励',
        DIANLIANG_GET_TYPE.INVITE
      );
    }

    // 判断是否赠送给注册人
    if (inviteConfig.rewardUserValue > 0) {
      this.addUserDianliang(
        userId,
        inviteConfig.rewardUserValue,
        '受邀注册奖励',
        DIANLIANG_GET_TYPE.ACTIVITY
      );
    }

    let userInviteData = {
      userId: friend.id, // 邀请人用户id
      friendId: userId, // 受邀人用户id
      dianliang: inviteConfig.rewardInviterValue, // 邀请人奖励电量
      friendDianliang: inviteConfig.rewardUserValue, // 受邀人奖励电量
    };

    this.userInviteEntity.save(userInviteData);
  }
}
