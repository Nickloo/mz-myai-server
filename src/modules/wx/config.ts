import { ModuleConfig } from '@cool-midway/core';

/**
 * 模块配置
 */
export default () => {
  return {
    // 模块名称
    name: '微信模块',
    // 模块描述
    description: '微信相关处理，与具体业务无关',
    // 中间件，只对本模块有效
    middlewares: [],
    // 中间件，全局有效
    globalMiddlewares: [],
    // 模块加载顺序，默认为0，值越大越优先加载
    order: 0,
    // 小程序
    mini: {
      appid: '',
      secret: '',
    },
    // 公众号 妙言AI
    mp: {
      appid: '',
      secret: '',
    },
  } as ModuleConfig;
};
