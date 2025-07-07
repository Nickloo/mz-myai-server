import { ModuleConfig } from '@cool-midway/core';

/**
 * 模块配置
 */
export default () => {
  return {
    // 模块名称
    name: '应用商店',
    // 模块描述
    description: 'xxx',
    // 中间件，只对本模块有效
    middlewares: [],
    // 中间件，全局有效
    globalMiddlewares: [],
    // 模块加载顺序，默认为0，值越大越优先加载
    order: 0,
    // myaiConfig: {
    //   name: '妙言AI助手',
    //   description: '妙言AI助手的官方应用',
    //   prePrompt: '我是妙言AI,你的工作、生活私人助理',
    //   // 妙言AI助手的官方应用
    //   appSecret:'app-IUIKGBAgl8cCXArv4YIUoSPR'
    // }
  } as ModuleConfig;
};
