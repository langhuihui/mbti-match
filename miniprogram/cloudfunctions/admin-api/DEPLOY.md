# admin-api 云函数部署指南（@cloudbase/js-sdk 版）

## 方案说明

后台使用 `@cloudbase/js-sdk` 直接调用 `admin-api` 云函数。
**无需开启 HTTP 触发器**，SDK 内部处理鉴权和调用链路。

```
后台 Vue → @cloudbase/js-sdk → callFunction('admin-api') → 云数据库
```

## 1. 上传部署云函数

在微信开发者工具中：
1. 右键 `cloudfunctions/admin-api` → **上传并部署：云端安装依赖**
2. 等待部署完成

## 2. 设置云函数环境变量

在云开发控制台 → 云函数 → admin-api → 配置 → 环境变量：
```
ADMIN_TOKEN = 你的管理后台密码
```

## 3. 创建云数据库集合

在云开发控制台 → 数据库，创建以下集合：

| 集合名 | 用途 |
|--------|------|
| users | 用户数据 |
| assessments | 测定完整分析记录 |
| assessments_sessions | 对话会话记录 |
| relation_reports | 关系对比缓存 |
| learning_content | 学习路径内容 |
| counselors | 咨询师认证 |

## 4. 配置后台环境变量

在 `admin/` 目录创建 `.env` 文件：
```
VITE_DATA_MODE=auto
VITE_CLOUD_ENV_ID=cloud1-7gp43sck0ad2f04a
VITE_ADMIN_TOKEN=你的管理后台密码（与云函数 ADMIN_TOKEN 一致）
```

## 5. 重启后台开发服务器

```bash
cd admin && npm run dev
```

## 6. 验证

1. 打开 http://localhost:5174
2. 输入密码登录（= ADMIN_TOKEN 的值）
3. Dashboard 顶部应显示绿色提示「已连接云开发数据库」

## 数据模式说明

| 模式 | VITE_DATA_MODE | 行为 |
|------|----------------|------|
| Mock | mock | 纯前端假数据，不调云函数 |
| Cloud | cloud | 仅调云函数，失败报错 |
| Auto | auto | 优先云函数，失败降级 mock（推荐） |

## 鉴权流程

1. 后台登录时输入密码 → 作为 ADMIN_TOKEN
2. 每次调用云函数时，token 通过 `_adminToken` 参数传入
3. 云函数 `auth.js` 校验 `_adminToken` 与环境变量 `ADMIN_TOKEN` 是否一致
4. 通过则执行查询，不通过返回 401

## 故障排查

- **登录失败/鉴权错误**：检查 ADMIN_TOKEN 环境变量是否设置，与密码是否一致
- **集合不存在错误**：按步骤 3 创建所有集合
- **SDK 初始化失败**：检查 VITE_CLOUD_ENV_ID 是否正确
- **CORS 错误**：SDK 走 WebSocket/HTTP 长连接，一般无 CORS 问题；如遇问题检查网络环境
