import { Config, Inject, Provide } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
// import { InjectEntityModel } from '@midwayjs/typeorm';
// import { Repository } from 'typeorm';
// import { OrderInfoEntity } from '../entity/info';
// @ts-ignore
import { sign } from 'alipay-sdk/lib/util';
import { CoolWxPay, CoolAliPay } from '@cool-midway/pay';
// @ts-ignore
import AlipayFormData from 'alipay-sdk/lib/form';
// @ts-ignore
import { Decimal } from 'decimal.js';
// import { UserVipService } from '../../user/service/vip';
// import { SeesionSocketService } from '../../session/service/socket';
import { Context } from '@midwayjs/koa';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { PackageOrderEntity } from '../../order/entity/packageOrder';
import { Repository } from 'typeorm';
import { PackageOrderTmpEntity } from '../../order/entity/packageOrderTmp';
import { ORDER_STATUS, PAY_STATUS, PAY_WAY } from '../../../comm/types';
import { PayEntity } from '../entity/pay';
import { UserMembershipService } from '../../user/service/membership';
import { Utils } from '../../../utils/utils';

/**
 * 支付
 */
@Provide()
export class OrderPayService extends BaseService {
  @InjectEntityModel(PackageOrderEntity)
  orderEntity: Repository<PackageOrderEntity>;

  @InjectEntityModel(PackageOrderTmpEntity)
  orderTmpEntity: Repository<PackageOrderTmpEntity>;

  @InjectEntityModel(PayEntity)
  PayEntity: Repository<PayEntity>;

  @Config('appName')
  appName: string;

  // 微信支付
  @Inject()
  wxPay: CoolWxPay;

  // 支付宝支付
  @Inject()
  aliPay: CoolAliPay;

  @Inject()
  userMembershipService: UserMembershipService;

  // @Inject()
  // seesionSocketService: SeesionSocketService;

  @Inject()
  ctx: Context;

  @Inject()
  utils: Utils;

  // /**
  //  * 微信APP支付
  //  * @param orderId
  //  * @returns
  //  */
  // async wxApp(orderId: number) {
  //   const info = await this.orderInfo(orderId);
  //   const params = {
  //     description: `${this.appName}-订单`,
  //     out_trade_no: info?.orderNum,
  //     notify_url: this.wxPay.coolWxPay.notify_url,
  //     amount: {
  //       total: new Decimal(info.price).times(100).toNumber(),
  //     },
  //   };
  //   const result = await this.wxPay.getInstance().transactions_app(params);
  //   return result;
  // }

  /**
   * 微信二维码支付
   * @param orderId
   */
  async wxQrcode(orderId: number) {
    try {
      const order = await this.tmpOrderInfo(orderId);
      const params = {
        description: `${this.appName}-${order.packageName}`,
        out_trade_no: order?.orderNo,
        notify_url: this.wxPay.coolWxPay.notify_url,
        amount: {
          total: new Decimal(order.amount).times(100).toNumber(),
        },
      };
      const result = await this.wxPay.getInstance().transactions_native(params);
      return result;
    } catch (error) {
      // Handle the error here
      this.ctx.logger.error(error);
      throw error;
    }
  }

  /**
   * 微信JSAPI支付
   * @param orderId
   */
  async wxJsPay(orderId: number, openid: string, appid?: string) {
    try {
      const order = await this.tmpOrderInfo(orderId);
      const params = {
        appid: appid,
        description: `${this.appName}-${order.packageName}`,
        // out_trade_no: new Date().getTime() + '',
        out_trade_no: order.orderNo,
        notify_url: this.wxPay.coolWxPay.notify_url,
        amount: {
          total: new Decimal(order.amount).times(100).toNumber(),
        },
        payer: {
          openid: openid,
        },
      };
      const result = await this.wxPay.getInstance().transactions_jsapi(params);
      return result;
    } catch (error) {
      // Handle the error here
      this.ctx.logger.error(error);
      throw error;
    }
  }

  /**
   * 微信H5支付
   * @param orderId
   */
  async wxH5Pay(orderId: number) {
    try {
      const order = await this.tmpOrderInfo(orderId);
      let ips = await this.utils.getReqIP(this.ctx);
      let ip = typeof ips === 'string' ? ips : ips.join(',');
      const params = {
        description: `${this.appName}-${order.packageName}`,
        out_trade_no: order?.orderNo,
        notify_url: this.wxPay.coolWxPay.notify_url,
        amount: {
          total: new Decimal(order.amount).times(100).toNumber(),
        },
        scene_info: {
          payer_client_ip: ip || '127.0.0.1',
          h5_info: {
            type: 'wap',
            app_name: '妙言AI',
          },
        },
      };
      const result = await this.wxPay.getInstance().transactions_h5(params);
      return result;
    } catch (error) {
      // Handle the error here
      this.ctx.logger.error(error);
      throw error;
    }
  }

  /**
   * 微信退款
   * @param order
   */
  // async wxRefund(order: OrderInfoEntity) {
  //   const params = {
  //     description: `${this.appName}-订单`,
  //     out_trade_no: order.orderNum,
  //     notify_url: this.wxPay.coolWxPay.notify_url,
  //     amount: {
  //       refund: new Decimal(order.refundAmount).times(100).toNumber(),
  //       total: new Decimal(order.price).times(100).toNumber(),
  //     },
  //   };
  //   const result = await this.wxPay.getInstance().transactions_app(params);
  //   return result.status == 'SUCCESS';
  // }

  /**
   * 订单信息
   * @param orderId
   */
  async orderInfo(orderId: number) {
    const order = await this.orderEntity.findOneBy({ id: orderId });
    if (!order && order?.status != 0) {
      throw new CoolCommException('订单不存在或不是可支付的状态');
    }
    return order;
  }

  /**
   * 临时订单信息
   * @param orderId
   */
  async tmpOrderInfo(orderId: number) {
    const order = await this.orderTmpEntity.findOneBy({ id: orderId });
    if (!order && order?.status != 0) {
      throw new CoolCommException('订单不存在或不是可支付的状态');
    }
    return order;
  }

  /**
   * 支付宝App支付
   * @param orderId
   */
  // async aliApp(orderId: number) {
  //   const info = await this.orderInfo(orderId);
  //   // 返回支付链接
  //   const data = sign(
  //     'alipay.trade.app.pay',
  //     {
  //       notifyUrl: this.aliPay.coolAlipay.notifyUrl,
  //       bizContent: {
  //         subject: `${this.appName}-订单`,
  //         totalAmount: info.price,
  //         outTradeNo: info.orderNum,
  //         productCode: 'QUICK_MSECURITY_PAY',
  //         body: {},
  //       },
  //     },
  //     this.aliPay.getInstance().config
  //   );
  //   const payInfo = new URLSearchParams(data).toString();
  //   return payInfo;
  // }

  // /**
  //  * 支付宝扫码支付
  //  * @param orderId
  //  */
  // async aliQrcode(orderId: number, width = 400): Promise<any> {
  //   const info = await this.orderInfo(orderId);
  //   const formData = new AlipayFormData();
  //   // 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url
  //   formData.setMethod('get');
  //   formData.addField('notifyUrl', this.aliPay.coolAlipay.notifyUrl);
  //   formData.addField('bizContent', {
  //     outTradeNo: info.orderNum,
  //     productCode: 'FAST_INSTANT_TRADE_PAY',
  //     totalAmount: info.price,
  //     subject: `${this.appName}-订单`,
  //     qrPayMode: 4,
  //     qrcodeWidth: width,
  //     body: JSON.stringify({
  //       orderId,
  //     }),
  //   });
  //   // 返回支付链接
  //   const result = await this.aliPay
  //     .getInstance()
  //     .exec('alipay.trade.page.pay', {}, { formData });
  //   return result;
  // }

  // /**
  //  * 支付宝支付回调通知
  //  * @param data
  //  */
  // async aliNotify(data: any) {
  //   // 检查签名
  //   const check = await this.aliPay.signVerify(data);
  //   if (check && data.trade_status == 'TRADE_SUCCESS') {
  //     await this.paySuccess(data.out_trade_no, 1);
  //   }
  // }

  /**
   * 微信支付回调通知
   * 处理套餐订单逻辑
   * TODO: 根据订单类型处理不同的逻辑
   */
  async wxNotify(body: any) {
    // 验签
    const check = await this.wxPay.signVerify(this.ctx);
    const { ciphertext, associated_data, nonce } = body.resource;
    const data: any = this.wxPay
      .getInstance()
      .decipher_gcm(ciphertext, associated_data, nonce);
    // 验签通过，处理业务逻辑
    if (check && data.trade_state == 'SUCCESS') {
      await this.paySuccess(data.out_trade_no, PAY_WAY.WX, data.transaction_id);
    }
  }

  /**
   * 支付成功
   * @param orderNo
   * @param payWay
   * @param transactionId 支付商交易编号
   */
  async paySuccess(orderNo: string, payWay: number, transactionId: string) {
    const tmpOrder = await this.orderTmpEntity.findOneBy({ orderNo });
    // 1. 更新tmp订单状态
    tmpOrder.status = ORDER_STATUS.PAYED;
    tmpOrder.payWay = payWay;
    tmpOrder.payTime = new Date();
    await this.orderTmpEntity.save(tmpOrder);
    // 2. 创建正式订单
    await this.orderEntity.save(tmpOrder);
    // 3. 处理会员充值逻辑
    await this.userMembershipService.paySuccess(
      tmpOrder.userId,
      tmpOrder.packageId
    );
    // const order = await this.orderInfoEntity.findOneBy({ orderNum });
    // this.seesionSocketService.sendByUserId(order.userId, 'paySuccess', order);
    // 生成支付记录
    await this.PayEntity.save({
      orderId: tmpOrder.id,
      userId: tmpOrder.userId,
      amount: tmpOrder.amount,
      payTime: tmpOrder.payTime,
      payWay,
      payNo: this.wxPay.createOrderNum(),
      status: PAY_STATUS.PAYED,
      merchantTransactionId: transactionId,
    });
  }

  // /**
  //  * 订单号
  //  * @param order
  //  */
  // async aliRefund(order: OrderInfoEntity) {
  //   const result = await this.aliPay.getInstance().exec('alipay.trade.refund', {
  //     bizContent: {
  //       out_trade_no: order.orderNum,
  //       refund_amount: order.price,
  //       refund_reason: order.refundReason,
  //     },
  //   });
  //   return result.code == '10000';
  // }
}
