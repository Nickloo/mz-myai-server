// 模型温度配置
export const modelTemperatureParams = {
  // 创意
  "creative": {
    "temperature": 0.8,
    "top_p": 0.9,
    "frequency_penalty": 0.2,
    "presence_penalty": 0.2,
  },
  // 平衡
  "balance": {
    "temperature": 0.5,
    "top_p": 0.85,
    "frequency_penalty": 0.2,
    "presence_penalty": 0.3,
  },
  // 精准
  "precision": {
    "temperature": 0.2,
    "top_p": 0.75,
    "frequency_penalty": 0.5,
    "presence_penalty": 0.5,
  },
}

export type modelTemperatureParams = {
  [key in TemperatureModeEnum]: {
    temperature: number // 随机性，越大越随机
    top_p: number // 0-1，核采样，越大单词越多样性
    frequency_penalty: number // 词频惩罚，越大越不重复
    presence_penalty: number // 话题新鲜度，越大越新鲜

  }
}

export const enum TemperatureModeEnum {
  "creative" = "creative",
  "balance" = "balance",
  "precision" = "precision"
}