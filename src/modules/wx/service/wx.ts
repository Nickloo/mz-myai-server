import { Inject, Provide } from '@midwayjs/decorator';
import { BaseService } from '@cool-midway/core';
import { CacheManager } from '@midwayjs/cache';
import axios from 'axios';

/**
 * 描述
 */
@Provide()
export class WxService extends BaseService {

  @Inject()
  cacheManager: CacheManager;

  public async getWxAccessToken(appid: string, secret: string,) {
    const ACCESS_TOKEN_RDS_KEY = 'wx:accessToken'
    const token = await this.cacheManager.get(ACCESS_TOKEN_RDS_KEY)
    // 如果redis中有，直接返回
    if (token) return token
    const url = `https://api.weixin.qq.com/cgi-bin/stable_token`
    //@ts-ignore
    const res = await axios.post(url, {
      grant_type: 'client_credential',
      appid,
      secret,
      force_refresh: false
    })
    if (res.data.errcode) {
      this.baseCtx.logger.error(res.data.errmsg);
    }
    const accessToken = res.data.access_token
    const expiresIn = res.data.expires_in
    if (accessToken) {
      // 存入redis
      await this.cacheManager.set(ACCESS_TOKEN_RDS_KEY, accessToken, { ttl: expiresIn })
    }
    return accessToken
  }
}
