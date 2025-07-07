// llm模型名称
export enum MODEL_NAMES {
  GPT3_5_TURBO = 'gpt-3.5-turbo',
  GPT_4 = 'gpt-4'
}


// order状态
export enum ORDER_STATUS {
  WAIT_PAY = 0,
  PAYED = 1,
  CANCEL = 9
}

// pay状态
export enum PAY_STATUS {
  PAYED = 1,
  REFUND = 9
}

// 支付方式
export enum PAY_WAY {
  WX = 1,
  ALI = 2,
  BALANCE = 3
}

// 获得类型 1-会员 2-充值 3-签到 4-兑换 5-任务 6-活动 7-分成 8-新注册 9-邀请
export enum DIANLIANG_GET_TYPE {
  MEMBERSHIP = 1,
  RECHARGE = 2,
  SIGN = 3,
  EXCHANGE = 4,
  TASK = 5,
  ACTIVITY = 6,
  FENCHENG = 7,
  REGISTER = 8,
  INVITE = 9,
}

// 对话类型
export enum DIALOG_MODE {
  CHAT = 'chat',  // 聊天
  COMPLETION = 'completion'  // 补全
}

// 对话类型number
export enum DIALOG_MODE_TYPE {
  CHAT = 1,  // 聊天
  COMPLETION = 2  // 补全
}

// sms类型
export enum SMS_TYPE {
  LOGIN = 'login',  // 登录
  REGISTER = 'register',  // 注册
  RESET = 'reset',  // 重置
  SECURITY = 'security',  // 安全认证
  BIND = 'bind',  // 绑定
  CHANGE = 'change',  // 变更

}