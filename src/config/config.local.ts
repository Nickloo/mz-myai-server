import { CoolConfig } from '@cool-midway/core';
import { MidwayConfig } from '@midwayjs/core';

/**
 * 本地开发 npm run dev 读取的配置文件
 */
export default {
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '123456',
        database: 'db_mz_myai',
        // 自动建表 注意：线上部署的时候不要使用，有可能导致数据丢失
        synchronize: true,
        // 打印日志
        logging: false,
        // logging: true,
        // 字符集
        charset: 'utf8mb4',
        // 是否开启缓存
        cache: true,
        // 实体路径
        entities: ['**/modules/*/entity'],
      },
    },
  },
  dify: {
    host: 'http://192.168.31.250:8088', // dify
  },
  koa: {
    port: 8002,
  },
  var: {
    host: 'https://xxxxxxx.ngrok-free.app',
  },
  cool: {
    eps: true,
    // 是否自动导入数据库
    initDB: true,
    // crud配置
    crud: {
      // 软删除
      softDelete: true,
    },
  } as CoolConfig,
} as MidwayConfig;
