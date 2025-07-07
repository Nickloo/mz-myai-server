import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Get, Inject, Post } from '@midwayjs/core';
import { UserInfoService } from '../../service/info';
import { UserInfoEntity } from '../../entity/info';
import { ProfileDTO } from '../../dto/profile';
import { Validate } from '@midwayjs/validate';

/**
 * 用户信息
 */
@CoolController({
  api: [],
  entity: UserInfoEntity,
})
export class AppUserInfoController extends BaseController {
  @Inject()
  ctx;

  @Inject()
  userInfoService: UserInfoService;

  @Get('/person', { summary: '获取用户信息' })
  async person() {
    return this.ok(await this.userInfoService.person(this.ctx.user.id));
  }

  @Post('/updatePerson', { summary: '更新用户信息' })
  @Validate()
  async updatePerson(@Body() body: ProfileDTO) {
    return this.ok(
      await this.userInfoService.updatePerson(this.ctx.user.id, body)
    );
  }

  @Get('/userSignData', { summary: '获取用户签到数据' })
  async getUserSignData() {
    return this.ok(
      await this.userInfoService.getUserSignData(this.ctx.user.id)
    );
  }

  @Get('/inviteCode', { summary: '获取用户邀请码' })
  async getUserInviteCode() {
    return this.ok(
      await this.userInfoService.getUserInviteCode(this.ctx.user.id)
    );
  }
}
