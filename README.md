mz-myai-server项目 是 妙言AI 的核心服务端组件，作为 妙言AI 的一部分，它需要配合前端界面和后台管理端使用。

### 前端项目
https://github.com/Nickloo/mz-myai-website
### 后台管理端项目
https://github.com/Nickloo/mz-myai-admin

## 🚀 快速开始


### 启动Node服务

1. 克隆仓库：

   ```bash
   git clone https://github.com/Nickloo/mz-myai-server.git
   cd mz-myai-server
   ```

2. 安装依赖：

   ```bash
   npm install  # 或使用 yarn install 或 pnpm install
   ```

3. 启动本地服务：

   ```bash
   npm run dev
   ```

4. 访问本地服务：

   ```
   http://localhost:8002
   ```

### 配置

#### 配置数据库

编辑 `config.default.ts` 文件，配置数据库连接参数

```ts
{
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: 'pwd',
  database: 'db_myai_dev',
}
```
