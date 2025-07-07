import { Rule, RuleType } from '@midwayjs/validate';
import { TemperatureModeEnum } from '../../../comm/config';

/**
 * 参数校验
 */
export class ChatDTO {
  // 用户消息
  @Rule(RuleType.string().required())
  content: string;

  // 表单input obj
  @Rule(RuleType.object())
  input: string;

  // 消息类型
  @Rule(RuleType.number())
  contentType: string;

  // 模型id
  @Rule(RuleType.number())
  modelId: number;

  @Rule(RuleType.string())
  modelName: string

  // 对话ID 可以为空
  @Rule(RuleType.string().allow(''))
  dialogId: string;

  // appid
  @Rule(RuleType.string())
  appId: string;

  // modelConfig
  @Rule(RuleType.object())
  modelConfig: ModelConfig;

  @Rule(RuleType.string())
  temperatureMode: TemperatureModeEnum;

}
