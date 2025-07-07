import {
  CoolController,
  BaseController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { Body, Get, Inject, Post, Query } from '@midwayjs/core';
import { UserLoginService } from '../../service/login';
import { BaseSysLoginService } from '../../../base/service/sys/login';
import { QRCODE_TYPE } from '../../../../comm/const';

/**
 * 登录
 */
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['mini', 'mp', 'phone', 'captcha', 'smsCode', 'refreshToken', 'qrcode', 'qrcodeStatus'],
})
@CoolController()
export class AppUserLoginController extends BaseController {
  @Inject()
  userLoginService: UserLoginService;

  @Inject()
  baseSysLoginService: BaseSysLoginService;

  @Post('/mini', { summary: '小程序登录' })
  async mini(@Body() body) {
    const { code, encryptedData, iv } = body;
    return this.ok(await this.userLoginService.mini(code, encryptedData, iv));
  }

  @Post('/mp', { summary: '公众号登录' })
  async mp(
    @Body('code') code: string,
    @Body('isBind') isBind: any,
    @Body('inviteCode') inviteCode: any
  ) {
    return this.ok(await this.userLoginService.mp(code, isBind, inviteCode));
  }

  @Post('/phone', { summary: '手机验证码登录' })
  async phone(
    @Body() body: { phone: string; smsCode: string; inviteCode: string }
  ) {
    const { phone, smsCode, inviteCode } = body;
    return this.ok(
      await this.userLoginService.phone(phone, smsCode, inviteCode)
    );
  }

  @Get('/captcha', { summary: '图片验证码' })
  async captcha(
    @Query('type') type: string,
    @Query('width') width: number,
    @Query('height') height: number,
    @Query('color') color: string
  ) {
    return this.ok(
      await this.baseSysLoginService.captcha(type, width, height, color)
    );
  }

  @Post('/smsCode', { summary: '验证码' })
  async smsCode(
    @Body('phone') phone: string,
    @Body('captchaId') captchaId: string,
    @Body('code') code: string
  ) {
    return this.ok(await this.userLoginService.smsCode(phone, captchaId, code));
  }

  @Post('/refreshToken', { summary: '刷新token' })
  public async refreshToken(@Body('refreshToken') refreshToken) {
    return this.ok(await this.userLoginService.refreshToken(refreshToken));
  }

  @Get('/qrcode', { summary: '获取微信登录二维码' })
  public async qrCode(@Query('inviteCode') inviteCode?: string) {
    return this.ok(await this.userLoginService.generateQRCode(QRCODE_TYPE.LOGIN, inviteCode))
  }

  /**
   * 用户登录状态(前端轮询)
   */
  @Post('/qrcodeStatus', { summary: '轮询用户登录状态' })
  public async qrCodeStatus(@Body('uuid') uuid: string) {
    const result = await this.userLoginService.getQrLoginStatus(uuid)
    if (result) {
      return this.ok(result)
    }
    return this.ok({ token: null })
  }

}
