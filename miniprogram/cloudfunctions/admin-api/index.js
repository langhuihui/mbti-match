/**
 * admin-api 云函数入口
 *
 * HTTP 触发器入口，处理后台管理系统的所有数据请求。
 * 鉴权后根据 action 分发到对应处理器。
 *
 * 请求格式：POST { action, ...params }
 * 鉴权：Authorization: Bearer <ADMIN_TOKEN>
 * 返回：{ success: true, data: ... } 或 { success: false, error: '...' }
 */

const cloud = require('wx-server-sdk')
const config = require('./config')
const { authenticate } = require('./auth')
const handlers = require('./handlers')

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()

  // HTTP 触发时解析 body
  let body = event
  if (event.httpMethod === 'POST' && event.body) {
    try {
      body = JSON.parse(event.body)
    } catch (e) {
      return { success: false, error: '请求体格式错误，期望 JSON' }
    }
  }

  const { action, ...params } = body

  // === 鉴权 ===
  if (!authenticate(event)) {
    return {
      success: false,
      error: '未授权：token 无效或缺失',
      code: 'UNAUTHORIZED',
    }
  }

  // === action 校验 ===
  if (!action) {
    return { success: false, error: '缺少 action 参数' }
  }

  if (!config.ALLOWED_ACTIONS.includes(action)) {
    return { success: false, error: `未知的 action: ${action}`, code: 'UNKNOWN_ACTION' }
  }

  // === 分发到处理器 ===
  try {
    const handler = handlers[action]
    if (!handler) {
      return { success: false, error: `处理器未实现: ${action}` }
    }

    const result = await handler(params)
    return { success: true, data: result }
  } catch (err) {
    // 集合不存在等错误友好提示
    const errMsg = err.errMsg || err.message || String(err)
    let friendlyError = errMsg
    if (errMsg.includes('collection not exists') || errMsg.includes('DATABASE_COLLECTION_NOT_EXIST')) {
      friendlyError = `云数据库集合不存在，请先创建所需集合（详见部署文档）`
    }
    return { success: false, error: friendlyError, code: err.code || 'HANDLER_ERROR' }
  }
}
