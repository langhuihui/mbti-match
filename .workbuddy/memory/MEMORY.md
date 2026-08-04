# MBTI Match 项目长期记忆

## 项目概况
- 微信小程序 mbti-match，appid: wxb7b00c2ba031f9e6
- 云开发环境 ID: cloud1-7gp43sck0ad2f04a
- 项目根: /Users/dexter/project/mbti-match
- 小程序根: miniprogram/，云函数根: miniprogram/cloudfunctions/
- 后台 admin: 独立 Vite + Vue3 + Element Plus 项目，端口 5174，依赖 @cloudbase/js-sdk 直连云函数

## admin 后台 ↔ 云函数架构
- admin 前端（admin/src/services/cloudbase.js）用 @cloudbase/js-sdk 调用 admin-api 云函数
- **Web 端 callFunction 前必须先匿名登录**（app.auth({persistence:'local'}).signInAnonymously()），且需在云开发控制台开启「匿名登录」——否则表现为"云函数不可用"。2026-07-31 已补此登录步骤。
- admin-api 云函数（miniprogram/cloudfunctions/admin-api/）: index.js 入口 + auth.js(token校验) + config.js(集合名/白名单) + handlers.js(14个action) + DEPLOY.md
- 鉴权：前端传 _adminToken，云函数 auth.js 比对环境变量 ADMIN_TOKEN（默认 'dexter'，与 admin/.env 的 VITE_ADMIN_TOKEN 一致）
- 数据模式 VITE_DATA_MODE: mock/cloud/auto（auto=云函数失败降级 mock，Dashboard 顶部黄/绿提示反映状态）
- admin-api 14 个 action: getOverview/getUsers/getUserDetail/getAssessments/getAssessmentDetail/getRelations/getCacheStats/getMbtiDistribution/getEnneagramDistribution/getDailyActivity/getRiskAlerts/getLearningContent/updateLearningContent/getCounselors/authorizeCounselor

## 云函数清单（miniprogram/cloudfunctions/）
- admin-api：后台管理数据接口
- track：埋点上报
- msgSecCheck：内容安全
- llm-chat：LLM 对话（测定/关系分析）

## 已知问题/待办
- 业务数据（users/assessments/relations 等）上云未完成，小程序 config/cloud.js 的 CLOUD_TRACKING_ENABLED=false
- admin-api handlers 依赖的 7 个业务集合可能尚未创建、未写入数据；即使云函数跑通，明细页可能为空
- 根目录还有个空的 cloudfunctions/（与 miniprogram/cloudfunctions/ 重复，project.config.json 指向后者）

## 技术栈备忘
- admin: Vue3 + Pinia + vue-router + Element Plus + ECharts + @cloudbase/js-sdk ^2.32 + Vite 7
- 小程序: 原生小程序 + wx-server-sdk 云函数
