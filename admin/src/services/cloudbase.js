/**
 * CloudBase 数据服务层
 *
 * 使用 @cloudbase/js-sdk 直接调用 admin-api 云函数
 * 无需 HTTP 触发器，SDK 内部处理鉴权和调用
 *
 * 三种数据模式：
 *   - mock:  纯前端假数据（开发用，云环境未配置时）
 *   - cloud: 仅使用云函数调用（失败即报错）
 *   - auto:  优先云函数，失败降级 mock（推荐）
 */

import cloudbase from '@cloudbase/js-sdk'
import { mockDataService } from './mockData'

// === 配置 ===
const ENV_ID = import.meta.env.VITE_CLOUD_ENV_ID || ''
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || ''
const DATA_MODE = import.meta.env.VITE_DATA_MODE || 'auto'

// === CloudBase 实例 ===
let app = null
let functions = null

/**
 * 初始化 CloudBase
 *
 * 注意：@cloudbase/js-sdk 在 Web 端调用 callFunction 之前必须先完成登录，
 * 否则请求会被云开发直接拒绝（表现就是「云函数不可用」）。
 * 管理后台用匿名登录即可，业务鉴权由云函数内的 ADMIN_TOKEN 完成。
 * 前置条件：云开发控制台 → 设置 → 登录方式 → 开启「匿名登录」。
 */
async function initCloudBase() {
  if (!ENV_ID) {
    console.warn('[cloudbase] VITE_CLOUD_ENV_ID 未配置，将使用 Mock 数据')
    return false
  }
  try {
    app = cloudbase.init({ env: ENV_ID })
    functions = app.functions()
    const auth = app.auth({ persistence: 'local' })
    await auth.signInAnonymously()
    return true
  } catch (err) {
    console.error('[cloudbase] 初始化或匿名登录失败：', err?.message || err)
    console.error('[cloudbase] 请确认：1) 云开发控制台已开启「匿名登录」；2) VITE_CLOUD_ENV_ID 正确（当前：' + ENV_ID + '）')
    return false
  }
}

let cloudReady = null
let cloudVerified = false  // 是否已验证云函数真的可用

/**
 * 确保 CloudBase 已初始化
 */
async function ensureCloud() {
  if (cloudReady === null) {
    cloudReady = initCloudBase()
  }
  return cloudReady
}

/**
 * 尝试一次真实调用验证云函数是否可用
 */
async function verifyCloud() {
  if (cloudVerified) return true
  if (!await ensureCloud()) return false
  try {
    const result = await functions.callFunction({
      name: 'admin-api',
      data: { action: 'getOverview', _adminToken: ADMIN_TOKEN },
    })
    const res = result.result || result
    if (res.success) {
      cloudVerified = true
      return true
    }
    // 云函数执行了但返回失败（多为集合不存在 / token 不匹配）
    console.warn('[cloudbase] 云函数返回失败：', res.error || res.code)
    if (res.error && /集合|collection/i.test(res.error)) {
      console.warn('[cloudbase] → 请按 admin-api/DEPLOY.md 创建 users/assessments 等数据库集合')
    } else if (res.code === 'UNAUTHORIZED') {
      console.warn('[cloudbase] → ADMIN_TOKEN 不匹配：检查 .env 的 VITE_ADMIN_TOKEN 与云函数环境变量 ADMIN_TOKEN')
    }
  } catch (e) {
    const msg = e?.message || String(e)
    console.warn('[cloudbase] 云函数调用失败，降级 Mock。错误：', msg)
    if (/not found|FunctionName|-502001|FUNCTION_NOT_FOUND/i.test(msg)) {
      console.warn('[cloudbase] → admin-api 云函数尚未上传部署：在微信开发者工具右键 cloudfunctions/admin-api → 上传并部署：云端安装依赖')
    } else if (/UNAUTHORIZED|未登录|登录态|-41015|SIGN/i.test(msg)) {
      console.warn('[cloudbase] → 登录态问题：云开发控制台 → 设置 → 登录方式 → 开启「匿名登录」')
    } else if (/collection|DATABASE_COLLECTION/i.test(msg)) {
      console.warn('[cloudbase] → 云数据库集合不存在，请按 DEPLOY.md 创建所需集合')
    }
  }
  return false
}

/**
 * 调用 mock 数据
 */
async function callMock(action, params = {}) {
  const handler = mockDataService[action]
  if (!handler) {
    console.warn(`[mock] 未实现 action: ${action}`)
    return { data: [], total: 0 }
  }
  return handler(params)
}

/**
 * 调用云函数 admin-api
 *
 * SDK 的 callFunction 封装了鉴权，无需手动管理 token
 * 云函数内通过环境变量 ADMIN_TOKEN 校验
 */
async function callCloud(action, params = {}) {
  if (!await ensureCloud()) {
    throw new Error('CloudBase 未初始化，请检查 VITE_CLOUD_ENV_ID')
  }

  const result = await functions.callFunction({
    name: 'admin-api',
    data: { action, ...params, _adminToken: ADMIN_TOKEN },
  })

  // SDK 返回 { result: { success, data, error } }
  const res = result.result || result
  if (!res.success) {
    throw new Error(res.error || '云函数返回失败')
  }
  return res.data
}

/**
 * 统一调用入口
 * auto 模式下：先试云函数，失败降级 mock
 */
async function callAPI(action, params = {}) {
  if (DATA_MODE === 'mock') {
    return callMock(action, params)
  }

  if (DATA_MODE === 'cloud') {
    return callCloud(action, params)
  }

  // auto 模式
  try {
    if (await ensureCloud()) {
      return await callCloud(action, params)
    }
  } catch (err) {
    console.warn(`[auto] 云函数调用失败，降级 mock: ${action}`, err.message)
  }
  cloudVerified = false  // 标记为降级
  return callMock(action, params)
}

export const dataService = {
  // === Dashboard 概览 ===
  async getOverview() {
    return callAPI('getOverview')
  },

  // === 用户管理 ===
  async getUsers(params) {
    return callAPI('getUsers', params)
  },

  async getUserDetail(userId) {
    return callAPI('getUserDetail', { userId })
  },

  // === 测定记录 ===
  async getAssessments(params) {
    return callAPI('getAssessments', params)
  },

  async getAssessmentDetail(id) {
    return callAPI('getAssessmentDetail', { id })
  },

  // === 关系报告 ===
  async getRelations(params) {
    return callAPI('getRelations', params)
  },

  async getCacheStats() {
    return callAPI('getCacheStats')
  },

  // === 数据分析 ===
  async getMbtiDistribution() {
    return callAPI('getMbtiDistribution')
  },

  async getEnneagramDistribution() {
    return callAPI('getEnneagramDistribution')
  },

  async getDailyActivity(days) {
    return callAPI('getDailyActivity', { days })
  },

  // === 风险监控 ===
  async getRiskAlerts(params) {
    return callAPI('getRiskAlerts', params)
  },

  // === 内容管理 ===
  async getLearningContent(params) {
    return callAPI('getLearningContent', params)
  },

  async updateLearningContent(id, data) {
    return callAPI('updateLearningContent', { id, data })
  },

  // === 咨询师管理 ===
  async getCounselors(params) {
    return callAPI('getCounselors', params)
  },

  async authorizeCounselor(counselorId, data) {
    return callAPI('authorizeCounselor', { counselorId, data })
  },
}

/**
 * 检查当前数据模式状态（供 UI 展示）
 * usingMock 初始为 true（未验证前），验证成功后变 false
 */
let _usingMock = true

export function getDataMode() {
  return {
    mode: DATA_MODE,
    cloudConfigured: !!ENV_ID,
    usingMock: _usingMock,
  }
}

/**
 * 异步验证云函数可用性，更新 mock 状态
 * Dashboard 加载时调用
 */
export async function checkCloudStatus() {
  if (DATA_MODE === 'mock') {
    _usingMock = true
    return false
  }
  const ok = await verifyCloud()
  _usingMock = !ok
  return ok
}
