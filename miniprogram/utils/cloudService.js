/**
 * 云开发服务层
 * 未配置 CLOUD_ENV_ID 时所有方法安全降级，不阻塞主流程。
 */
const { CLOUD_ENV_ID } = require('../config/cloud')

let _initialized = false
let _available = false

function isCloudEnabled() {
  return _available && !!CLOUD_ENV_ID
}

function initCloud() {
  if (_initialized) return _available
  _initialized = true

  if (!CLOUD_ENV_ID || !wx.cloud) {
    console.info('[cloud] 未配置云环境，使用本地降级模式')
    return false
  }

  try {
    wx.cloud.init({
      env: CLOUD_ENV_ID,
      traceUser: true
    })
    _available = true
    console.info('[cloud] 初始化成功', CLOUD_ENV_ID)
  } catch (e) {
    console.warn('[cloud] 初始化失败', e)
    _available = false
  }

  return _available
}

const CALL_FUNCTION_TIMEOUT_MS = 8000

function callFunction(name, data = {}) {
  if (!isCloudEnabled()) {
    return Promise.resolve({ result: null, offline: true })
  }
  const call = wx.cloud.callFunction({ name, data })
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('timeout')), CALL_FUNCTION_TIMEOUT_MS)
  })
  return Promise.race([call, timeout])
    .then((res) => res)
    .catch((err) => {
      console.warn('[cloud] callFunction failed', name, err && err.message ? err.message : err)
      return { result: null, error: err }
    })
}

function checkTextSecurity(text) {
  if (!text || typeof text !== 'string') {
    return Promise.resolve({ safe: true })
  }
  if (!isCloudEnabled()) {
    return Promise.resolve({ safe: true, offline: true })
  }
  return callFunction('msgSecCheck', { content: text })
    .then((res) => {
      const result = res.result || {}
      if (result.errCode === 0 || result.safe === true) {
        return { safe: true }
      }
      return {
        safe: false,
        reason: result.reason || '内容未通过安全审核，请修改后重试'
      }
    })
}

module.exports = {
  initCloud,
  isCloudEnabled,
  callFunction,
  checkTextSecurity
}
