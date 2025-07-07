import { Provide, Config, Inject } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
import * as _ from 'lodash';
import { CacheManager } from '@midwayjs/cache';
import { CoolSms } from '@cool-midway/sms';
import { SMS_TYPE } from '../../../comm/types';

/**
 * 描述
 */
@Provide()
export class UserSmsService extends BaseService {
  // 获得模块的配置信息
  @Config('module.user')
  config;

  @Inject()
  cacheManager: CacheManager;

  @Inject()
  coolSms: CoolSms;

  /**
   * 发送验证码
   * @param phone
   */
  async sendSms(phone: string, type = SMS_TYPE.LOGIN) {
    try {
      const code = await this.coolSms.sendCode(phone);
      this.cacheManager.set(`sms:${phone}:${type}`, `${code}`, this.config.sms.timeout);
    } catch (error) {
      throw new CoolCommException('发送过于频繁，请稍后再试');
    }
  }

  /**
   * 验证验证码
   * @param phone
   * @param code
   * @returns
   */
  async checkCode(phone: string, code: string, type = 'login') {
    if (process.env.NODE_ENV === 'local' && code === '123456') {
      return true;
    }
    const cacheCode = await this.cacheManager.get(`sms:${phone}:${type}`);
    if (_.isEmpty(cacheCode) && !_.isNumber(cacheCode)) {
      return false;
    }
    if (cacheCode == code) {
      return true;
    }
    return false;
  }
}
