import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';
/**
 * 套餐订单参数校验
 */
export class PackageOrderDTO {
  // 套餐ID
  @ApiProperty()
  @Rule(RuleType.number().required())
  packageId: number;

  // 支付方式
  @Rule(RuleType.number().allow(null))
  payType: 1 | 2 | 3; // 1-微信扫码支付 2-微信JSAPI支付 3-微信H5支付

  // 支付方式
  @Rule(RuleType.string().allow(null))
  mpCode: string; // 微信公众号授权码
}
