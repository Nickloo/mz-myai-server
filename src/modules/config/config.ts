import { ModuleConfig } from '@cool-midway/core';
import { CONFIG_KEY } from '../../comm/const';
/**
 * 模块配置
 */
export default () => {
  return {
    // 模块名称
    name: '配置',
    // 模块描述
    description: '',
    // 中间件，只对本模块有效
    middlewares: [],
    // 中间件，全局有效
    globalMiddlewares: [],
    // 模块加载顺序，默认为0，值越大越优先加载
    order: 0,
    // 默认配置
    [CONFIG_KEY.INVITE]: {
      rewardUserValue: 100, // 奖励用户电量
      rewardInviterValue: 100, // 奖励邀请人电量
      banner: '',
    },
    [CONFIG_KEY.WEBSITE]: {
      workbench: {
        menu: {
          homeIcon: '', // 工作台图标
          collectIcon: '', // 我的常用图标
          creationIcon: '', // 我的创作图标
        },
      },
    },
  } as ModuleConfig;
};
