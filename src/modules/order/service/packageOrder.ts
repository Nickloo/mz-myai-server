import { Config, Inject, Provide } from '@midwayjs/decorator';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { In, Repository } from 'typeorm';
import { PackageOrderEntity } from '../entity/packageOrder';
import { CoolWxPay } from '@cool-midway/pay';
import { MembershipPackageEntity } from '../../membership/entity/package';
import { ORDER_STATUS } from '../../../comm/types';
import { Context } from '@midwayjs/koa';
import { OrderPayService } from '../../pay/service/pay';
import { PackageOrderDTO } from '../dto/order';
import { PackageOrderTmpEntity } from '../entity/packageOrderTmp';
import { UserWxEntity } from '../../user/entity/wx';
import { UserWxService } from '../../user/service/wx';

/**
 * 套餐订单service
 */
@Provide()
export class PackageOrderService extends BaseService {
  @InjectEntityModel(PackageOrderEntity)
  orderEntity: Repository<PackageOrderEntity>;

  @InjectEntityModel(PackageOrderTmpEntity)
  orderTmpEntity: Repository<PackageOrderTmpEntity>;

  @InjectEntityModel(MembershipPackageEntity)
  packageEntity: Repository<MembershipPackageEntity>;

  @InjectEntityModel(UserWxEntity)
  userWxEntity: Repository<UserWxEntity>;

  @Inject()
  ctx: Context;

  @Inject()
  wxPay: CoolWxPay;

  @Inject()
  payService: OrderPayService;

  @Inject()
  userWxService: UserWxService;

  @Config('module.user')
  useConfig;

  /**
   * 生成订单
   */
  async createOrder(packageId: number) {
    const order = await this.getOrderData(packageId);
    await this.orderEntity.save(order);
    return order;
  }

  /**
   * 生成临时订单
   */
  async createTmpOrder(packageId: number) {
    const order = await this.getOrderData(packageId);
    await this.orderTmpEntity.save(order);
    return order;
  }

  /**
   * 组装order数据
   */
  async getOrderData(packageId: number) {
    const packageInfo = await this.getPackageInfo(packageId);
    if (!packageInfo) throw new CoolCommException('套餐不存在');
    const order = new PackageOrderEntity();
    order.userId = this.ctx.user.id;
    order.orderNo = this.wxPay.createOrderNum(22); // 这个库最小长度22 QPS20万
    order.packageId = packageId;
    order.packageName = packageInfo.name;
    order.amount = packageInfo.price;
    order.status = ORDER_STATUS.WAIT_PAY;
    return order;
  }

  /**
   * 创建订单并返回支付二维码参数
   */
  async createOrderAndPay(params: PackageOrderDTO) {
    const { packageId } = params;
    const order = await this.createOrder(packageId);
    return await this.payService.wxQrcode(order.id);
  }

  /**
   * 创建订单并返回支付二维码参数
   */
  async createTmpOrderAndPay(params: PackageOrderDTO) {
    const { packageId, payType = 1, mpCode } = params;
    const order = await this.createTmpOrder(packageId);
    let payData = {};
    let userId = this.ctx.user.id as number;
    let userWx = <UserWxEntity>{};
    let openid = '';
    switch (payType) {
      // 扫码支付
      case 1:
        payData = await this.payService.wxQrcode(order.id);
        break;
      // JSAPI支付
      case 2:
        // 获取用户的微信信息
        userWx = await this.userWxEntity.findOne({
          where: { userId: userId },
        });
        openid = userWx?.openid;
        // 如果用户没有绑定微信，则获取用户微信信息
        if (!userWx) {
          let wxUserInfo = await this.userWxService.mpUserInfo(mpCode);
          openid = wxUserInfo.openid;
        }

        payData = await this.payService.wxJsPay(
          order.id,
          openid,
          this.useConfig.wx.mp.appid
        );
        break;
      // H5支付
      case 3:
        payData = await this.payService.wxH5Pay(order.id);
        break;
      default:
        break;
    }

    return {
      ...payData,
      orderNo: order.orderNo,
    };
  }

  async getPackageInfo(packageId: number) {
    return await this.packageEntity.findOneBy({ id: packageId });
  }

  // 获取订单支付状态
  async getOrderPayStatus(orderNo: string, userId: number) {
    const order = await this.orderTmpEntity.findOneBy({ userId, orderNo });
    if (!order) throw new CoolCommException('订单不存在');
    return order.status;
  }
}
