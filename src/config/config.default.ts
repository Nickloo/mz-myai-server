import { CoolConfig, CoolSmsConfig, MODETYPE, OSSConfig } from '@cool-midway/core';
import { MidwayConfig } from '@midwayjs/core';
import * as redisStore from 'cache-manager-ioredis';
import * as fs from 'fs';

export default {
  appName: '妙言AI',
  // use for cookie sign key, should change to your own and keep security
  keys: 'cool-admin for node',
  koa: {
    port: 8001,
  },
  // body解析支持xml，否则收不到微信回调
  bodyParser: {
    enableTypes: ['json', 'form', 'text', 'xml'],
    formLimit: '10mb',
    jsonLimit: '10mb',
    textLimit: '10mb',
    xmlLimit: '10mb',
  },
  // 模板渲染
  view: {
    mapping: {
      '.html': 'ejs',
    },
  },
  // 文件上传
  upload: {
    fileSize: '200mb',
    whitelist: null,
  },
  // 缓存 可切换成其他缓存如：redis http://midwayjs.org/docs/extensions/cache
  cache: {
    store: redisStore,
    options: {
      host: 'localhost', // default value
      port: 6379, // default value
      password: '',
      db: 6,
      keyPrefix: 'cache:',
      ttl: 60 * 60 * 24 * 30 // 默认一个月清理
    },
  },
  throttler: {
    ttl: 1, //（秒）时间窗口，在该时间段内限制 limit 个数的请求， 超出限流
    limit: 10, //请求个数限制
    // storage: IThrottlerStorageOption,    //内部存储配置，支持 memory | redis 两种存储方式
    errorMsg: '请稍后再试', //超出限流后的报错信息
  },
  dify: {
    host: 'http://192.168.31.250:8088', // dify
  },
  bull: {
    defaultQueueOptions: {
      redis: {
        port: 6379,
        host: '127.0.0.1',
        password: '',
      },
    }
  },
  cool: {
    file: {
      // 上传模式 本地上传或云存储
      mode: MODETYPE.CLOUD,
      // 本地上传 文件地址前缀
      // domain: 'http://127.0.0.1:8001',
      oss: {
        accessKeyId: 'xxxxxxxxxxx',
        accessKeySecret: 'xxxxxxxxxxx',
        bucket: 'xxxx',
        endpoint: 'oss-cn-beijing.aliyuncs.com',
        timeout: '3600s',
      } as OSSConfig,
    },
    // 支付
    pay: {
      wx: {
        appid: 'xxxxxxxxx',
        mchid: 'xxxxxxxxx',
        publicKey: fs.readFileSync('src/config/keys/wepay/apiclient_cert.pem'),
        privateKey: fs.readFileSync('src/config/keys/wepay/apiclient_key.pem'),
        notify_url: 'https://8b0zrvvw-8001.inc1.devtunnels.ms/open/pay/orderPay/wxNotify',
        key: 'xxxxxxxxxxx'
      },
    },
    sms: {
      ali: {
        accessKeyId: 'xxxxxxx',
        accessKeySecret: 'xxxxxxx',
        signName: 'xxxx',
        template: 'SMS_2xxxxxxxx',
      },
    } as CoolSmsConfig,
  } as CoolConfig,
} as MidwayConfig;
