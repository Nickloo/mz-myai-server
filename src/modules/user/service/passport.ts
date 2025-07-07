import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { UserSmsService } from './sms';
import { Context } from '@midwayjs/koa';
import { UserInfoEntity } from '../entity/info';
import { SMS_TYPE } from '../../../comm/types';

/**
 * 描述
 */
@Provide()
export class UserPassportService extends BaseService {

  @Inject()
  ctx: Context;

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @Inject()
  userSmsService: UserSmsService;


  /**
   * 换绑手机号
   */
  async changePhone(params) {
    const { oldCode, newPhone, newCode } = params
    const userId = this.ctx.user.id
    const userInfo = await this.userInfoEntity.findOne({ where: { id: userId } })
    const oldPhone = userInfo.phone
    if (oldPhone == newPhone) throw new CoolCommException('新手机号不能与原手机号相同')
    // 验证码校验
    const oldCodeCheck = await this.userSmsService.checkCode(oldPhone, oldCode, SMS_TYPE.SECURITY)
    if (!oldCodeCheck) throw new CoolCommException('原手机号验证码错误')
    const newCodeCheck = await this.userSmsService.checkCode(newPhone, newCode, SMS_TYPE.CHANGE)
    if (!newCodeCheck) throw new CoolCommException('新手机号验证码错误')
    const user = await this.userInfoEntity.findOne({ where: { phone: newPhone } })
    if (user) throw new CoolCommException('该手机号已被绑定')
    await this.userInfoEntity.update({ id: userId }, { phone: newPhone })
    return 'ok'
  }

  /**
   * 发送我的手机验证码
   * 安全认证
   * @param type 
   * @returns 
   */
  async sendMyPhoneSms(type = SMS_TYPE.SECURITY) {
    const userId = this.ctx.user.id
    const userInfo = await this.userInfoEntity.findOne({ where: { id: userId } })
    const phone = userInfo.phone
    if (!phone) throw new CoolCommException('请先绑定手机号')
    await this.userSmsService.sendSms(phone, type)
    return '发送成功'
  }

  /**
   * 验证验证码
   * @param code 验证码
   */
  async validateSmsCode(code) {
    const userId = this.ctx.user.id;
    const userInfo = await this.userInfoEntity.findOne({
      where: { id: userId },
    });
    const oldCodeCheck = await this.userSmsService.checkCode(
      userInfo.phone,
      code,
      SMS_TYPE.SECURITY
    );
    if (!oldCodeCheck) throw new CoolCommException('验证码错误');
  }

  /**
   * 绑定手机号
   * @param phone 手机号
   * @param code 验证码
   */
  async bindPhone(phone: string, code: string) {
    if (!phone || !code) throw new CoolCommException('手机号或验证码错误');
    const newCodeCheck = await this.userSmsService.checkCode(
      phone,
      code,
      SMS_TYPE.BIND
    );

    if (!newCodeCheck) throw new CoolCommException('验证码错误');

    const user = await this.userInfoEntity.findOne({
      where: { phone },
    });

    if (user) throw new CoolCommException('该手机号已被绑定');

    const updateUser = await this.userInfoEntity.findOne({
      where: { id: this.ctx.user.id },
    });

    if (updateUser.phone) throw new CoolCommException('请先解绑手机号');
    updateUser.phone = phone;
    await updateUser.save();
  }
}
