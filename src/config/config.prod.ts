import { CoolConfig, MODETYPE, OSSConfig } from '@cool-midway/core';
import { MidwayConfig } from '@midwayjs/core';
import * as fs from 'fs';

/**
 * 本地开发 npm run prod 读取的配置文件
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
        synchronize: false,
        // 打印日志
        logging: false,
        // 字符集
        charset: 'utf8mb4',
        // 是否开启缓存
        cache: true,
        // 实体路径
        entities: ['**/modules/*/entity'],
      },
    },
  },
  cool: {
    pay: {
      wx: {
        appid: 'xxxxx',
        mchid: 'xxxxx',
        publicKey: fs.readFileSync('src/config/keys/wepay/apiclient_cert.pem'),
        privateKey: fs.readFileSync('src/config/keys/wepay/apiclient_key.pem'),
        notify_url: 'https://www.xxxxx.com/app-api/open/pay/orderPay/wxNotify',
        key: 'xxxxx'
      },
    },
    file: {
      // 上传模式 本地上传或云存储
      mode: MODETYPE.CLOUD,
      // 本地上传 文件地址前缀
      // domain: 'http://127.0.0.1:8001',
      oss: {
        accessKeyId: 'xxxxxxx',
        accessKeySecret: 'xxxxxxxxx',
        bucket: 'mz-myai-comm',
        endpoint: 'oss-cn-beijing.aliyuncs.com',
        timeout: '3600s',
      } as OSSConfig,
    },
    // 是否自动导入数据库，生产环境不建议开，用本地的数据库手动初始化
    initDB: false,
  } as CoolConfig,
} as MidwayConfig;
