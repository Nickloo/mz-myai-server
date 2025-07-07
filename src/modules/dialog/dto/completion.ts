import { Rule, RuleType } from '@midwayjs/validate';
import { TemperatureModeEnum } from '../../../comm/config';

/**
 * 参数校验
 */
export class CompletionDTO {

  // 表单input obj
  @Rule(RuleType.object())
  inputs: string;

  // 消息类型
  @Rule(RuleType.number())
  contentType: string;

  // 模型id
  @Rule(RuleType.number())
  modelId: number;

  // 对话ID 不可为空
  @Rule(RuleType.string().required())
  appId: string;

  @Rule(RuleType.string())
  temperatureMode?: TemperatureModeEnum;

  // modelConfig
  // @Rule(RuleType.object())
  // modelConfig: ModelConfig;

}
