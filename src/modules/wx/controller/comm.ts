import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Get, Inject, Post, Query } from '@midwayjs/core';
import * as xml2js from 'xml2js';
import { UserLoginService } from '../../user/service/login';
import { UserInfoService } from '../../user/service/info';

/**
 * 微信通用控制器
 * 处理回调等
 */
@CoolController()
export class CommWxController extends BaseController {

  @Inject()
  userLoginService: UserLoginService

  @Inject()
  userInfoService: UserInfoService

  /**
   * 微信事件回调
   * 扫描带参数二维码事件
   */
  @Get('/qrcode/callback')
  async qrcodeCallback(@Query() query: any) {
    console.log('qrcodeCallback', query)
    return this.baseCtx.body = query.echostr
  }

  /**
   * 微信事件回调
   * 1. 成功后需要用户登录注册
   * @param xml 
   * @returns 
   */
  @Post('/qrcode/callback')
  async qrcodeCallbackPost(@Body() xml: any) {
    const jsonData = await xml2js.parseStringPromise(xml)
    // let returnData = null
    const data: scanEventData = jsonData.xml // 实际数据
    // console.log('jsonData:', jsonData)
    // 判断事件类型（扫描带参数二维码事件）
    if (data.MsgType[0] === 'event' && (data.Event[0] === 'SCAN' || data.Event[0] === 'subscribe')) {
      console.log('qrcode:', data.MsgType[0])
      const qrcodeData = this.userLoginService.paraseQrcodeData(data.EventKey[0])
      const { type } = JSON.parse(qrcodeData)
      if (type === 'login') {
        this.userLoginService.qrCodeLogin(data)
      }
      if (type === 'bind') {
        this.userInfoService.qrCodeBind(data)
      }
    }
    // 返回公众号登录消息
    const builder = new xml2js.Builder()
    const xmlStr = builder.buildObject({
      xml: {
        ToUserName: data.FromUserName[0],
        FromUserName: 'MiaoyanAi', // 必须写公众号微信号
        CreateTime: Date.now(),
        MsgType: 'text',
        Content: '妙言AI登录成功，在AI时代做更好的自己！😄',
      }
    })

    return this.baseCtx.body = xmlStr
  }

}
