module.exports = {
  apps: [
    {
      name: 'myai-server-test',
      script: './bootstrap.js',
      exec_mode: 'cluster', //启动模式
      watch: false, //监听文件变动重启
      instances: 1,
      error_file: '~/logs/error.log', //错误输出日志
      out_file: '~/logs/out.log', //日志
      log_date_format: 'YYYY-MM-DD HH:mm Z', //日期格式
      env: {
        NODE_ENV: 'test',
      },
    },
    {
      name: 'myai-server-prod',
      script: './bootstrap.js',
      exec_mode: 'cluster', //启动模式
      watch: false, //监听文件变动重启
      instances: 2,
      error_file: '~/logs/error.log', //错误输出日志
      out_file: '~/logs/out.log', //日志
      log_date_format: 'YYYY-MM-DD HH:mm Z', //日期格式
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
