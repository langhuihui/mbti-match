/**
 * 文本内容安全检测
 * 调用 openapi.security.msgSecCheck
 */
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const { content } = event
  if (!content || typeof content !== 'string') {
    return { safe: true, errCode: 0 }
  }

  try {
    const res = await cloud.openapi.security.msgSecCheck({
      content: content.slice(0, 5000)
    })
    if (res.errCode === 0) {
      return { safe: true, errCode: 0 }
    }
    return {
      safe: false,
      errCode: res.errCode,
      reason: '内容包含违规信息，请修改后重试'
    }
  } catch (err) {
    // 87014 = 内容违规
    if (err.errCode === 87014) {
      return { safe: false, errCode: 87014, reason: '内容包含违规信息，请修改后重试' }
    }
    console.error('msgSecCheck failed', err)
    return { safe: false, errCode: err.errCode || -1, reason: '内容审核失败，请稍后重试' }
  }
}
