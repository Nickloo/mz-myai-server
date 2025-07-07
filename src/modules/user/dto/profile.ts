import { Rule, RuleType } from '@midwayjs/validate';
/**
 * 个人资料参数校验
 */
export class ProfileDTO {
  // 头像
  @Rule(RuleType.string().allow(''))
  avatarUrl: string;

  // 昵称
  @Rule(RuleType.string().required())
  nickName: string;

  // 性别
  @Rule(RuleType.number())
  gender: number;

  // 个性签名
  @Rule(RuleType.string().allow(''))
  introduction: string;
}
