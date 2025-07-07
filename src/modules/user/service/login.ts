import { Config, Inject, Provide } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { UserInfoEntity } from '../entity/info';
import { UserWxService } from './wx';
import * as jwt from 'jsonwebtoken';
import { UserWxEntity } from '../entity/wx';
import { CoolFile } from '@cool-midway/file';
import { BaseSysLoginService } from '../../base/service/sys/login';
import { UserSmsService } from './sms';
import { v1 as uuid } from 'uuid';
import axios from 'axios';
import { randomUUID } from '@midwayjs/core/dist/util/uuid';
import { CacheManager } from '@midwayjs/cache';
import { Context } from '@midwayjs/koa';
import { QRCODE_TYPE } from '../../../comm/const';
import * as xml2js from 'xml2js';
import {
  generateNickName,
  generateUsername,
} from '../../../utils/generateInfo';
import { AwardService } from '../../award/service/award';
import { BaseSysParamService } from '../../base/service/sys/param';
import { ConfigService } from '../../config/service/config';
import { CONFIG_KEY } from '../../../comm/const';
import { UserInfoService } from './info';
import { WxService } from '../../wx/service/wx';

/**
 * 登录
 */
@Provide()
export class UserLoginService extends BaseService {
  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @InjectEntityModel(UserWxEntity)
  userWxEntity: Repository<UserWxEntity>;

  @Inject()
  ctx: Context;

  @Inject()
  userWxService: UserWxService;

  @Inject()
  wxService: WxService;

  @Config('module.user.jwt')
  jwtConfig;

  @Inject()
  baseSysLoginService: BaseSysLoginService;

  @Inject()
  awardService: AwardService;

  @Inject()
  file: CoolFile;

  @Inject()
  userSmsService: UserSmsService;

  @Inject()
  cacheManager: CacheManager;

  @Inject()
  baseSysParamService: BaseSysParamService;

  @Inject()
  configService: ConfigService;

  @Inject()
  userInfoService: UserInfoService;

  @Config('module.wx')
  config: any;

  /**
   * 发送手机验证码
   * @param phone
   * @param captchaId
   * @param code
   */
  async smsCode(phone, captchaId, code) {
    // 1、检查图片验证码  2、发送短信验证码
    // const check = await this.baseSysLoginService.captchaCheck(captchaId, code)
    // if (!check) {
    //   throw new CoolCommException('图片验证码错误')
    // }
    await this.userSmsService.sendSms(phone);
  }

  /**
   * 手机登录
   * @param phone
   * @param smsCode
   * @param inviteCode 邀请码
   */
  async phone(phone: string, smsCode: string, inviteCode?: string) {
    // 1、检查短信验证码  2、登录
    const check = await this.userSmsService.checkCode(phone, smsCode);
    // 手机号后四位
    const phoneEnd = phone.substring(phone.length - 4);
    let friend: any = null;
    if (check) {
      let user: any = await this.userInfoEntity.findOneBy({ phone });
      if (!user) {
        user = {
          phone,
          username: generateUsername(),
          // unionid: phone,
          registerFrom: 2,
          nickName: generateNickName([phoneEnd]),
          avatarUrl: await this.generateAvatar(),
        };

        // if (inviteCode) {
        //   friend = await this.userInfoEntity.findOne({
        //     where: { inviteCode: inviteCode },
        //   });
        // }

        // if (friend) {
        //   user.friendId = friend.id;
        // }

        const userInfo = await this.userInfoEntity.save(user);
        // 新用户奖励
        await this.awardService.rewardNewUser(userInfo.id);
        if (inviteCode) {
          await this.userInfoService.inviteReward(inviteCode, userInfo.id);
        }
      }
      return this.token({ id: user.id });
    } else {
      throw new CoolCommException('验证码错误');
    }
  }

  /**
   * 公众号登录
   * @param code
   * @param isBind 1-绑定 0-直接登录
   */
  async mp(code: string, isBind: any, inviteCode?: any) {
    let wxUserInfo = await this.userWxService.mpUserInfo(code);
    if (wxUserInfo) {
      delete wxUserInfo.privilege;
      // 检查是否已存在用户
      let wxUser = await this.userWxEntity.findOneBy({
        unionid: wxUserInfo.unionid,
      });
      wxUserInfo =
        wxUser ||
        (await this.saveWxInfo(
          {
            openid: wxUserInfo.openid,
            unionid: wxUserInfo.unionid,
            // avatarUrl: wxUserInfo.headimgurl,
            nickName: wxUserInfo.nickname,
            gender: wxUserInfo.sex,
            city: wxUserInfo.city,
            province: wxUserInfo.province,
            country: wxUserInfo.country,
            // userId: this.ctx?.user?.id || null,
          },
          1
        ));
      // 如果是绑定则更新用户的unionid
      if (isBind) {
        if (!this.ctx.user.id) throw new Error('微信登录失败');
        if (wxUserInfo.userId) throw new Error('当前微信已绑定其他用户');
        await this.userInfoEntity.update(
          { id: this.ctx.user.id },
          { unionid: wxUserInfo.unionid }
        );
        await this.userWxEntity.update(
          { unionid: wxUserInfo.unionid },
          { userId: this.ctx.user.id }
        );
        return 'success';
      }
      return this.wxLoginToken(wxUserInfo, inviteCode);
    } else {
      throw new Error('微信登录失败');
    }
  }

  /**
   * 保存微信信息
   * @param wxUserInfo
   * @param type
   * @returns
   */
  async saveWxInfo(wxUserInfo, type) {
    const find: any = { openid: wxUserInfo.openid };
    let wxInfo: any = await this.userWxEntity.findOneBy(find);
    if (wxInfo) {
      wxUserInfo.id = wxInfo.id;
    }
    await this.userWxEntity.save({
      ...wxUserInfo,
      type,
    });
    return wxUserInfo;
  }

  /**
   * 小程序登录
   * @param code
   * @param encryptedData
   * @param iv
   */
  async mini(code, encryptedData, iv) {
    let wxUserInfo = await this.userWxService.miniUserInfo(
      code,
      encryptedData,
      iv
    );
    if (wxUserInfo) {
      // 保存
      wxUserInfo = await this.saveWxInfo(wxUserInfo, 0);
      return await this.wxLoginToken(wxUserInfo);
    }
  }

  /**
   * 微信登录 获得token
   * @param wxUserInfo 微信用户信息
   * @returns
   */
  async wxLoginToken(wxUserInfo, inviteCode?: string) {
    const unionid = wxUserInfo.unionid ? wxUserInfo.unionid : wxUserInfo.openid;
    let userInfo: any = await this.userInfoEntity.findOneBy({ unionid });
    if (!userInfo) {
      const avatarUrl =
        (wxUserInfo.avatarUrl &&
          (await this.file.downAndUpload(
            wxUserInfo.avatarUrl,
            uuid() + '.png'
          ))) ||
        (await this.generateAvatar());
      userInfo = {
        unionid,
        nickName: wxUserInfo.nickName,
        avatarUrl,
        gender: wxUserInfo.gender,
      };
      await this.userInfoEntity.insert(userInfo);
      // 更新userId
      await this.userWxEntity.update(
        { unionid: unionid },
        { userId: userInfo.id }
      );
      // 新用户奖励
      this.awardService.rewardNewUser(userInfo.id);
      // 邀请奖励
      if (inviteCode) {
        this.userInfoService.inviteReward(inviteCode, userInfo.id);
      }
    }
    return this.token({ id: userInfo.id });
  }

  // qrcodeEventResponse{
  //   ToUserName: [ 'gh_454abf4d53ee' ],
  //   FromUserName: [ 'ovXP26Lyjf8hC-BFxl1R1QxKpwGA' ],
  //   CreateTime: [ '1692415942' ],
  //   MsgType: [ 'event' ],
  //   Event: [ 'SCAN' ],
  //   EventKey: [ '6343434a-b4a8-48a8-86a9-09e172e0d669' ],// or qrscene_b5788ba2-8b18-426b-b36a-c0787e0eb945
  //   Ticket: [
  //     'gQFd8TwAAAAAAAAAAS5odHRwOi8vd2VpeGluLnFxLmNvbS9xLzAyNndnMXA3WlBmU0UxMDAwMGcwN0wAAgS0NeBkAwQAAAAA'
  //   ]
  // }
  /**
   * 二维码登录注册
   * 若用户已注册，则把uuid和token存到redis
   * 若用户未注册，则先执行注册逻辑，再把uuid和token存到redis
   * 用户扫码关注公众号 公众号回调此接口
   * @param wxData
   */
  async qrCodeLogin(wxData: scanEventData) {
    const openid = wxData.FromUserName[0];
    // 获取用户unionid
    const { unionid } = await this.userWxService.getMpUserInfoByOpenid(openid);
    const qrcodeData = this.paraseQrcodeData(wxData.EventKey[0]); // 用户前端唯一标识
    const { uuid } = JSON.parse(qrcodeData);
    // let userWx = await this.userWxEntity.findOne({ where: { openid } })
    const userInfo = await this.userInfoEntity.findOne({ where: { unionid } });
    if (userInfo) {
      // 已注册
      // 生成token
      const tokenInfo = await this.token({ id: userInfo.id });
      // 存到redis(表示该用户已登录)
      await this.loginUser(uuid, tokenInfo);
    } else {
      // 未注册
      // // 获取用户unionid
      // const { unionid } = await this.userWxService.getMpUserInfoByOpenid(openid)
      let inviteCode: any = this.cacheManager.get(`QRCode:invite:${uuid}`);
      // 随机生成昵称
      const nickName = generateNickName();
      // 注册userInfo和userWx
      const userInfo = await this.userInfoEntity.save({
        unionid,
        nickName,
        registerFrom: 3,
        username: generateUsername(),
        avatarUrl: await this.generateAvatar(),
      });
      await this.userWxEntity.insert({
        openid,
        unionid,
        userId: userInfo.id,
        type: 1,
      });
      // 生成token
      const tokenInfo = await this.token({ id: userInfo.id });
      await this.loginUser(uuid, tokenInfo);
      // 新用户奖励
      this.awardService.rewardNewUser(userInfo.id);
      if (inviteCode) {
        this.userInfoService.inviteReward(inviteCode, userInfo.id);
      }
    }
    // 返回公众号登录消息
    const builder = new xml2js.Builder();
    const xmlStr = builder.buildObject({
      xml: {
        ToUserName: wxData.FromUserName[0],
        FromUserName: 'ai-zonghe',
        CreateTime: Date.now(),
        MsgType: 'text',
        Content: '欢迎访问AI综合网，让我们一起探索AI新时代！😄',
      },
    });
    return xmlStr;
  }

  /**
   * 生成微信公众号二维码
   * 用户扫码后可以触发事件（例如关注）
   * 目前的公众号登录就是扫码关注后即登录注册
   * doc: https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Receiving_event_pushes.html
   */
  async generateQRCode(type: QRCODE_TYPE = QRCODE_TYPE.LOGIN, inviteCode?: string) {
    let uuid = '';
    if (type === QRCODE_TYPE.LOGIN) {
      uuid = randomUUID(); // 前端未登录用户的唯一标识
    } else if (type === QRCODE_TYPE.BIND) {
      uuid = this.ctx.user.id;
    }
    const { appid, secret } = this.config.mp;
    const accessToken = await this.wxService.getWxAccessToken(appid, secret);
    const url = `https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${accessToken}`;
    const qrcodeStr = JSON.stringify({ uuid, type }); // 二维码携带的参数
    const res = await axios.post(url, {
      action_name: 'QR_LIMIT_STR_SCENE',
      action_info: { scene: { scene_str: qrcodeStr } },
      expire_seconds: 60,
    });
    const data: qrCodeTicketResponse = res.data;
    if (data.errcode) {
      this.ctx.logger.error(data.errmsg, '\n此时的token：', accessToken);
    }
    // 保存邀请码
    if (inviteCode) {
      this.cacheManager.set(`QRCode:invite:${uuid}`, inviteCode, {
        ttl: 60 * 60,
      });
    }
    return { ...data, _id: uuid };
  }

  /**
   * 生成绑定二维码(已登录)
   */
  // async generateBindQRCode() {
  //   const accessToken = await this.userWxService.getWxAccessToken()
  //   const uid = this.ctx.user.id
  //   const url = `https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${accessToken}`
  //   const res = await axios.post(url, {
  //     action_name: 'QR_LIMIT_STR_SCENE',
  //     action_info: { scene: { scene_str: uid } },
  //     expire_seconds: 60,
  //   })
  //   const data: qrCodeTicketResponse = res.data
  //   return { ...data }
  // }

  /**
   * 通过uuid获得用户登录状况
   * 如果登录了返回token，否则返回token=null
   * @param uuid
   */
  async getQrLoginStatus(uuid: string) {
    const tokenInfo = await this.cacheManager.get(`auth:qrlogin:${uuid}`);
    return tokenInfo;
  }

  /**
   * 刷新token
   * @param refreshToken
   */
  async refreshToken(refreshToken) {
    try {
      const info = jwt.verify(refreshToken, this.jwtConfig.secret);
      if (!info['isRefresh']) {
        throw new CoolCommException('token类型非refreshToken');
      }
      const userInfo = await this.userInfoEntity.findOneBy({
        id: info['id'],
      });
      return this.token(userInfo);
    } catch (e) {
      throw new CoolCommException(
        '刷新token失败，请检查refreshToken是否正确或过期'
      );
    }
  }

  /**
   * 获得token
   * @param info
   * @returns
   */
  async token(info) {
    const { expire, refreshExpire } = this.jwtConfig;
    return {
      expire,
      token: await this.generateToken(info),
      refreshExpire,
      refreshToken: await this.generateToken(info, true),
    };
  }

  /**
   * 生成token
   * @param tokenInfo 信息
   */
  async generateToken(info, isRefresh = false) {
    const { expire, refreshExpire, secret } = this.jwtConfig;
    const tokenInfo = {
      isRefresh,
      ...info,
    };
    return jwt.sign(tokenInfo, secret, {
      expiresIn: isRefresh ? refreshExpire : expire,
    });
  }

  /**
   * 随机生成头像
   */
  async generateAvatar() {
    let avatarList = await this.baseSysParamService.dataByKey('defaultAvatar');
    const pre = (avatarList && avatarList[0] && avatarList) || [
      'https://maiziit-common.oss-cn-beijing.aliyuncs.com/images/avatar/aizhDefaultAvatar.png',
    ];
    const avatar = pre[Math.floor(Math.random() * pre.length)];
    return avatar;
  }

  /**
   * 用户登录
   */
  async loginUser(uuid: string, tokenInfo: any) {
    // 存到redis(表示该用户已登录)
    await this.cacheManager.set(`auth:qrlogin:${uuid}`, tokenInfo, {
      ttl: this.jwtConfig.expire - 60,
    });
  }

  /**
   * 解析二维码里的数据
   * @param eventKey
   * @returns
   */
  paraseQrcodeData(eventKey: string) {
    // 如果是qrscene_开头的，去掉qrscene_
    return eventKey.startsWith('qrscene_')
      ? eventKey.replace('qrscene_', '')
      : eventKey;
  }

  /**
   * 解析用户uuid
   * EventKey: [ '6343434a-b4a8-48a8-86a9-09e172e0d669' ] // or qrscene_b5788ba2-8b18-426b-b36a-c0787e0eb945
   */
  // parseUserUuid(eventKey: string) {
  //   // 如果是qrscene_开头的，去掉qrscene_
  //   return eventKey.startsWith('qrscene_')
  //     ? eventKey.replace('qrscene_', '')
  //     : eventKey
  // }
}
