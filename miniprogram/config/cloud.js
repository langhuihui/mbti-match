/**
 * 云开发环境配置
 *
 * 开通云开发后，将环境 ID 填入 CLOUD_ENV_ID。
 * 留空时自动降级为纯本地模式（埋点队列仅存本地，内容安全走关键词过滤）。
 */
module.exports = {
  // 微信云开发环境 ID
  CLOUD_ENV_ID: 'cloud1-7gp43sck0ad2f04a',

  // 云函数埋点同步；部署 track 云函数并创建 events 集合后再设为 true
  CLOUD_TRACKING_ENABLED: false,

  // 云数据库集合名
  COLLECTIONS: {
    EVENTS: 'events',
    INVITES: 'invites',
    NOTES: 'notes'
  },

  // 埋点本地队列上限（超出时丢弃最旧事件）
  MAX_LOCAL_EVENT_QUEUE: 200
}
