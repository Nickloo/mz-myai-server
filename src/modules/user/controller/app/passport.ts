import {
  CoolController,
  BaseController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { Body, Inject, Post } from '@midwayjs/core';
import { UserPassportService } from '../../service/passport';
import { Throttle } from 'midway-throttler';
import { UserSmsService } from '../../service/sms';
import { SMS_TYPE } from '../../../../comm/types';

/**
 * 描述
 */
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['sendPhoneSms'],
})
@CoolController()
export class AppUserPassportController extends BaseController {

  @Inject()
  UserPassportService: UserPassportService;

  @Inject()
  userSmsService: UserSmsService;

  /**
   * 换绑手机
   */
  @Post('/changePhone', { summary: '换绑手机' })
  async changePhone(
    @Body('oldCode') oldCode: string,
    @Body('newPhone') newPhone: string,
    @Body('newCode') newCode: string
  ) {
    return this.ok(
      await this.UserPassportService.changePhone({ oldCode, newPhone, newCode })
    )
  }

  /**
   * 绑定手机号
   */
  @Post('/bindPhone', { summary: '绑定手机号' })
  async bindPhone(@Body('code') code: string, @Body('phone') phone: string) {
    return this.ok(await this.UserPassportService.bindPhone(phone, code));
  }

  @Throttle(1, 50)
  @Post('/sendSms', { summary: '发送我的手机验证码' })
  async sendSms() {
    return this.ok(await this.UserPassportService.sendMyPhoneSms())
  }

  @Throttle(1, 1)
  @Post('/validateSmsCode', { summary: '发送我的手机验证码' })
  async validateSmsCode(@Body('code') code: string) {
    return this.ok(await this.UserPassportService.validateSmsCode(code));
  }

  @Throttle(1, 50)
  @Post('/sendPhoneSms', { summary: '发送指定手机验证码' })
  async sendPhoneSms(
    @Body('phone') phone: string,
    @Body('type') type: SMS_TYPE
  ) {
    // 不允许传security类型
    if (type == SMS_TYPE.SECURITY) return this.fail('error')
    return this.ok(
      await this.userSmsService.sendSms(phone, type)
    )
  }

}
