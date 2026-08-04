/**
 * admin-api 云函数配置
 *
 * 部署说明：
 * 1. 上传部署此云函数
 * 2. （可选）在云函数环境变量设置 ADMIN_TOKEN 覆盖默认值
 */

module.exports = {
  // 管理员 token（与后台 .env 的 VITE_ADMIN_TOKEN 保持一致）
  // 部署后可在云函数环境变量设置 ADMIN_TOKEN 覆盖此默认值
  ADMIN_TOKEN: process.env.ADMIN_TOKEN || 'dexter',

  // 云数据库集合名
  COLLECTIONS: {
    USERS: 'users',
    ASSESSMENTS: 'assessments',
    ASSESSMENT_SESSIONS: 'assessments_sessions',
    RELATION_REPORTS: 'relation_reports',
    RISK_ALERTS: 'risk_alerts',
    LEARNING_CONTENT: 'learning_content',
    COUNSELORS: 'counselors',
  },

  // 分页默认值
  DEFAULT_PAGE_SIZE: 20,

  // 允许的 action 列表（白名单）
  ALLOWED_ACTIONS: [
    'getOverview',
    'getUsers',
    'getUserDetail',
    'getAssessments',
    'getAssessmentDetail',
    'getRelations',
    'getCacheStats',
    'getMbtiDistribution',
    'getEnneagramDistribution',
    'getDailyActivity',
    'getRiskAlerts',
    'getLearningContent',
    'updateLearningContent',
    'getCounselors',
    'authorizeCounselor',
  ],
}
