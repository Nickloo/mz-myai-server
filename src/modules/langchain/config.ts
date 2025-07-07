import { ModuleConfig } from '@cool-midway/core';

/**
 * 模块配置
 */
export default () => {
  return {
    // 模块名称
    name: 'langChain',
    // 模块描述
    description: 'langChain',
    // 中间件，只对本模块有效
    middlewares: [],
    // 中间件，全局有效
    globalMiddlewares: [],
    // 模块加载顺序，默认为0，值越大越优先加载
    order: 0,
    openai: {
      // key
      key: 'sk-pS4wEATJ3t13UmL',
      // 代理接口
      baseURL: 'https://api.aigcbest.top/v1',
    }

  } as ModuleConfig;
};
