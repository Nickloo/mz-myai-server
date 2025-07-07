import { CoolConfig } from '@cool-midway/core';
import { MidwayConfig } from '@midwayjs/core';

/**
* test环境配置
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
  // 缓存 可切换成其他缓存如：redis http://midwayjs.org/docs/extensions/cache
  // cache: {
  //   options: {
  //     host: 'redis', // default value
  //   },
  // },
  var: {
    host: 'https://f375-159-138-56-48.ngrok-free.app',
  },
  cool: {
    pay: {
      wx: {
        appid: 'xxxxxxxx',
        mchid: 'xxxxxxx',
        publicKey: require('fs').readFileSync('src/config/keys/wepay/apiclient_cert.pem'),
        privateKey: require('fs').readFileSync('src/config/keys/wepay/apiclient_key.pem'),
        notify_url: 'http://test.xxxxxxx.com/app-api/open/pay/orderPay/wxNotify',
        key: 'xxxxxxxxx'
      },
    },
    // 是否自动导入数据库
    initDB: false,
    // crud配置
    crud: {
      // 软删除
      softDelete: true,
    },
  } as CoolConfig,
} as MidwayConfig;
