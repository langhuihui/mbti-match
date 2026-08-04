/**
 * 鉴权模块 - 校验管理员 token
 *
 * 支持两种调用方式：
 *   1. @cloudbase/js-sdk 调用：token 通过 _adminToken 参数传入
 *   2. HTTP 触发调用：token 通过 Authorization header 传入
 */

const config = require('./config')

/**
 * 从请求中提取并校验 token
 * @param {object} event - 云函数 event
 * @returns {boolean} 是否通过鉴权
 */
function authenticate(event) {
  let token = ''

  // 方式1：SDK 调用，token 在参数中
  if (event._adminToken) {
    token = event._adminToken
  }

  // 方式2：HTTP 触发，token 在 header 中
  if (!token) {
    const headers = event.headers || event.header || {}
    const authHeader = headers.Authorization || headers.authorization || ''
    token = authHeader.replace(/^Bearer\s+/i, '').trim()
  }

  if (!token) {
    return false
  }

  // 与配置的 ADMIN_TOKEN 比对
  return token === config.ADMIN_TOKEN
}

module.exports = { authenticate }
