/**
 * 埋点事件批量写入云数据库
 * 集合：events
 * 字段：event, params, sessionId, timestamp, _openid, createdAt
 */
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event) => {
  const { events } = event
  if (!Array.isArray(events) || events.length === 0) {
    return { ok: true, count: 0 }
  }

  const wxContext = cloud.getWXContext()
  const now = db.serverDate()

  const docs = events.map((item) => ({
    event: item.event || 'unknown',
    params: item.params || {},
    sessionId: item.sessionId || '',
    clientTimestamp: item.timestamp || Date.now(),
    cloudEnv: item.cloudEnv || '',
    _openid: wxContext.OPENID,
    createdAt: now
  }))

  try {
    const tasks = docs.map((doc) => db.collection('events').add({ data: doc }))
    await Promise.all(tasks)
    return { ok: true, count: docs.length }
  } catch (err) {
    console.error('track write failed', err)
    return { ok: false, error: err.message }
  }
}
