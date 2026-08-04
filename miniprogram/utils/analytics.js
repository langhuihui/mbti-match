/**
 * 埋点服务
 *
 * 事件先写入本地队列，云开发可用时批量同步到 track 云函数。
 * 同时调用 wx.reportEvent（若基础库支持）供微信后台数据分析。
 */
const { CLOUD_ENV_ID, CLOUD_TRACKING_ENABLED, MAX_LOCAL_EVENT_QUEUE } = require('../config/cloud')
const cloudService = require('./cloudService')

const QUEUE_KEY = 'analytics_event_queue'
const SESSION_KEY = 'analytics_session_id'

// 标准事件名（与 PROGRESS.md 北极星指标对应）
const EVENTS = {
  APP_LAUNCH: 'app_launch',
  PAGE_VIEW: 'page_view',
  QUICK_TEST_START: 'quick_test_start',
  QUICK_TEST_COMPLETE: 'quick_test_complete',
  TYPE_SELECTED: 'type_selected',
  INVITE_SENT: 'invite_sent',
  INVITE_OPENED: 'invite_opened',
  MATCH_COMPLETED: 'match_completed',
  CARD_GENERATED: 'card_generated',
  POSTER_GENERATED: 'poster_generated',
  NOTE_PUBLISHED: 'note_published',
  NOTE_LIKED: 'note_liked',
  MICRO_RECORD_PUBLISHED: 'micro_record_published',
  MICRO_RECORD_SKIPPED: 'micro_record_skipped',
  SHARE: 'share'
}

let _sessionId = ''
let _flushing = false

function _getSessionId() {
  if (_sessionId) return _sessionId
  try {
    const cached = wx.getStorageSync(SESSION_KEY)
    if (cached) {
      _sessionId = cached
      return _sessionId
    }
  } catch (e) {}
  _sessionId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  try { wx.setStorageSync(SESSION_KEY, _sessionId) } catch (e) {}
  return _sessionId
}

function _getQueue() {
  try {
    return wx.getStorageSync(QUEUE_KEY) || []
  } catch (e) {
    return []
  }
}

function _saveQueue(queue) {
  try {
    const trimmed = queue.slice(-MAX_LOCAL_EVENT_QUEUE)
    wx.setStorageSync(QUEUE_KEY, trimmed)
  } catch (e) {}
}

function _reportToWechat(event, params) {
  if (typeof wx.reportEvent === 'function') {
    try {
      wx.reportEvent(event, params)
    } catch (e) {}
  }
}

function track(event, params = {}) {
  const payload = {
    event,
    params: params || {},
    sessionId: _getSessionId(),
    timestamp: Date.now(),
    cloudEnv: CLOUD_ENV_ID || 'local'
  }

  _reportToWechat(event, payload.params)

  const queue = _getQueue()
  queue.push(payload)
  _saveQueue(queue)

  if (CLOUD_TRACKING_ENABLED && cloudService.isCloudEnabled()) {
    _scheduleFlush()
  }

  return payload
}

let _flushTimer = null

function _scheduleFlush() {
  if (_flushTimer) return
  _flushTimer = setTimeout(() => {
    _flushTimer = null
    _flushQueue()
  }, 3000)
}

function trackPageView(page, extra = {}) {
  return track(EVENTS.PAGE_VIEW, { page, ...extra })
}

function _flushQueue() {
  if (_flushing || !CLOUD_TRACKING_ENABLED || !cloudService.isCloudEnabled()) return

  const queue = _getQueue()
  if (!queue.length) return

  _flushing = true
  const batch = queue.slice(0, 20)

  cloudService.callFunction('track', { events: batch })
    .then((res) => {
      if (res.error || res.offline || !(res.result && res.result.ok)) {
        _flushing = false
        return
      }
      const remaining = _getQueue().slice(batch.length)
      _saveQueue(remaining)
      _flushing = false
      if (remaining.length > 0) {
        setTimeout(_flushQueue, 500)
      }
    })
    .catch(() => {
      _flushing = false
    })
}

function flush() {
  return _flushQueue()
}

function getPendingCount() {
  return _getQueue().length
}

module.exports = {
  EVENTS,
  track,
  trackPageView,
  flush,
  getPendingCount
}
