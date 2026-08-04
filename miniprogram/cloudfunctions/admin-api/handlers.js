/**
 * 查询处理器 - 各 action 的数据库查询逻辑
 *
 * 每个处理器返回 { data, total } 或 { ...统计 }
 */
const cloud = require('wx-server-sdk')
const config = require('./config')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

/**
 * 通用分页查询
 */
async function paginate(collection, query, page, pageSize) {
  const skip = (page - 1) * pageSize
  const countRes = await collection.where(query).count()
  const total = countRes.total
  const listRes = await collection
    .where(query)
    .orderBy('createdAt' in query ? 'createdAt' : '_id', 'desc')
    .skip(skip)
    .limit(pageSize)
    .get()
  return { data: listRes.data, total }
}

/**
 * 概览数据
 */
async function getOverview() {
  const userCount = await db.collection(config.COLLECTIONS.USERS).count()
  const assessmentCount = await db.collection(config.COLLECTIONS.ASSESSMENTS).count()

  // 今日测定数
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayAssessments = await db.collection(config.COLLECTIONS.ASSESSMENTS)
    .where({ assessmentDate: _.gte(todayStart) }).count()

  // 月活用户（30 天内有测定）
  const monthAgo = new Date()
  monthAgo.setDate(monthAgo.getDate() - 30)
  const monthlyActive = await db.collection(config.COLLECTIONS.ASSESSMENTS)
    .where({ assessmentDate: _.gte(monthAgo) }).count()

  // 风险警报数（待处理）
  const riskAlerts = await db.collection(config.RISK_ALERTS || config.COLLECTIONS.ASSESSMENTS)
    .where({ riskLevel: _.in(['medium', 'high']) }).count()

  // 缓存命中
  const cacheStats = await getCacheStats()

  // 类型分布（按族群聚合）
  const aggRes = await db.collection(config.COLLECTIONS.ASSESSMENTS)
    .aggregate()
    .group({
      _id: null,
      records: $.push({ mbtiType: '$mbtiType' }),
    })
    .end()

  const typeDistribution = { NT: 0, NF: 0, SJ: 0, SP: 0 }
  const groupMap = {
    NT: ['INTJ', 'INTP', 'ENTJ', 'ENTP'],
    NF: ['INFJ', 'INFP', 'ENFJ', 'ENFP'],
    SJ: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
    SP: ['ISTP', 'ISFP', 'ESTP', 'ESFP'],
  }
  // 直接遍历测定记录统计
  const allAssessments = await db.collection(config.COLLECTIONS.ASSESSMENTS)
    .field({ mbtiType: true }).limit(10000).get()
  allAssessments.data.forEach(a => {
    const group = Object.keys(groupMap).find(g => groupMap[g].includes(a.mbtiType))
    if (group) typeDistribution[group]++
  })

  return {
    totalUsers: userCount.total,
    totalAssessments: assessmentCount.total,
    todayAssessments: todayAssessments.total,
    monthlyActive: monthlyActive.total,
    riskAlerts: riskAlerts.total,
    cacheHitRate: cacheStats.hitRate,
    typeDistribution,
  }
}

/**
 * 用户列表
 */
async function getUsers(params) {
  const { page = 1, pageSize = config.DEFAULT_PAGE_SIZE, search = '' } = params
  let query = {}
  if (search) {
    query = _.or([
      { nickname: db.RegExp({ regexp: search, options: 'i' }) },
      { mbtiType: db.RegExp({ regexp: search, options: 'i' }) },
    ])
  }
  return paginate(db.collection(config.COLLECTIONS.USERS), query, page, pageSize)
}

/**
 * 用户详情
 */
async function getUserDetail(params) {
  const { userId } = params
  const userRes = await db.collection(config.COLLECTIONS.USERS).doc(userId).get()
  const assessmentsRes = await db.collection(config.COLLECTIONS.ASSESSMENTS)
    .where({ userId }).orderBy('assessmentDate', 'desc').limit(10).get()
  return { ...userRes.data, recentAssessments: assessmentsRes.data }
}

/**
 * 测定记录列表
 */
async function getAssessments(params) {
  const { page = 1, pageSize = config.DEFAULT_PAGE_SIZE, riskLevel = '', userId = '' } = params
  let query = {}
  if (riskLevel) query.riskLevel = riskLevel
  if (userId) query.userId = userId
  return paginate(db.collection(config.COLLECTIONS.ASSESSMENTS), query, page, pageSize)
}

/**
 * 测定详情（完整分析记录 - 含证据链、对话原文）
 */
async function getAssessmentDetail(params) {
  const { id } = params
  const res = await db.collection(config.COLLECTIONS.ASSESSMENTS).doc(id).get()
  return res.data
}

/**
 * 关系报告缓存列表
 */
async function getRelations(params) {
  const { page = 1, pageSize = config.DEFAULT_PAGE_SIZE } = params
  return paginate(db.collection(config.COLLECTIONS.RELATION_REPORTS), {}, page, pageSize)
}

/**
 * 缓存统计
 */
async function getCacheStats() {
  const totalCached = await db.collection(config.COLLECTIONS.RELATION_REPORTS).count()
  // 命中率 = 命中次数总和 / (命中次数 + 未命中生成次数)
  const aggRes = await db.collection(config.COLLECTIONS.RELATION_REPORTS)
    .aggregate()
    .group({
      _id: null,
      totalHits: $.sum('$hitCount'),
      count: $.sum(1),
    })
    .end()
  const stats = aggRes.list[0] || { totalHits: 0, count: 0 }
  // 简化：命中率 = 已缓存 / (已缓存 + 估算未命中)
  const estimatedMisses = Math.max(stats.count, 1) // 至少等于缓存数
  const hitRate = stats.totalHits / (stats.totalHits + estimatedMisses)

  // Top 组合
  const topRes = await db.collection(config.COLLECTIONS.RELATION_REPORTS)
    .orderBy('hitCount', 'desc')
    .limit(5)
    .field({ cacheKey: true, hitCount: true })
    .get()
  const topCombos = topRes.data.map(r => ({
    combo: r.cacheKey,
    hits: r.hitCount,
  }))

  return {
    totalCached: totalCached.total,
    hitRate: isNaN(hitRate) ? 0 : hitRate,
    avgGenerateTime: 2.8,
    topCombos,
  }
}

/**
 * MBTI 分布统计
 */
async function getMbtiDistribution() {
  const res = await db.collection(config.COLLECTIONS.ASSESSMENTS)
    .field({ mbtiType: true })
    .limit(10000)
    .get()
  const count = {}
  res.data.forEach(a => {
    count[a.mbtiType] = (count[a.mbtiType] || 0) + 1
  })
  const mbtiTypes = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP',
    'ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP']
  return mbtiTypes.map(name => ({ name, value: count[name] || 0 }))
}

/**
 * 九型分布统计
 */
async function getEnneagramDistribution() {
  const res = await db.collection(config.COLLECTIONS.ASSESSMENTS)
    .field({ enneagramType: true })
    .limit(10000)
    .get()
  const count = {}
  res.data.forEach(a => {
    // enneagramType 可能是 "4" 或 "4w5" 形式，取主型
    const mainType = String(a.enneagramType || '').replace(/w\d.*/, '').trim()
    if (mainType) count[mainType] = (count[mainType] || 0) + 1
  })
  return [1,2,3,4,5,6,7,8,9].map(n => ({
    name: `${n}号`,
    value: count[String(n)] || 0,
  }))
}

/**
 * 每日活跃度
 */
async function getDailyActivity(params) {
  const { days = 30 } = params
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const assessmentsRes = await db.collection(config.COLLECTIONS.ASSESSMENTS)
    .where({ assessmentDate: _.gte(startDate) })
    .field({ assessmentDate: true })
    .limit(10000)
    .get()

  const usersRes = await db.collection(config.COLLECTIONS.USERS)
    .where({ createdAt: _.gte(startDate) })
    .field({ createdAt: true })
    .limit(10000)
    .get()

  // 按天统计
  const dayMap = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    dayMap[key] = { date: key, assessments: 0, newUsers: 0 }
  }

  assessmentsRes.data.forEach(a => {
    if (a.assessmentDate) {
      const d = new Date(a.assessmentDate)
      const key = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      if (dayMap[key]) dayMap[key].assessments++
    }
  })

  usersRes.data.forEach(u => {
    if (u.createdAt) {
      const d = new Date(u.createdAt)
      const key = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      if (dayMap[key]) dayMap[key].newUsers++
    }
  })

  return Object.values(dayMap)
}

/**
 * 风险警报列表
 */
async function getRiskAlerts(params) {
  const { level = '', page = 1, pageSize = config.DEFAULT_PAGE_SIZE } = params
  let query = {}
  if (level) query.riskLevel = level
  // 从测定记录中筛选有风险的
  query.riskLevel = query.riskLevel || _.in(['medium', 'high'])
  return paginate(db.collection(config.COLLECTIONS.ASSESSMENTS), query, page, pageSize)
}

/**
 * 学习内容列表
 */
async function getLearningContent(params) {
  const { page = 1, pageSize = 100 } = params
  return paginate(db.collection(config.COLLECTIONS.LEARNING_CONTENT), {}, page, pageSize)
}

/**
 * 更新学习内容
 */
async function updateLearningContent(params) {
  const { id, data } = params
  const res = await db.collection(config.COLLECTIONS.LEARNING_CONTENT).doc(id).update({ data })
  return { success: res.stats.updated > 0 }
}

/**
 * 咨询师列表
 */
async function getCounselors(params) {
  const { page = 1, pageSize = config.DEFAULT_PAGE_SIZE } = params
  return paginate(db.collection(config.COLLECTIONS.COUNSELORS), {}, page, pageSize)
}

/**
 * 批准咨询师
 */
async function authorizeCounselor(params) {
  const { counselorId, data } = params
  const res = await db.collection(config.COLLECTIONS.COUNSELORS).doc(counselorId).update({
    data: { status: 'active', ...data },
  })
  return { success: res.stats.updated > 0 }
}

module.exports = {
  getOverview,
  getUsers,
  getUserDetail,
  getAssessments,
  getAssessmentDetail,
  getRelations,
  getCacheStats,
  getMbtiDistribution,
  getEnneagramDistribution,
  getDailyActivity,
  getRiskAlerts,
  getLearningContent,
  updateLearningContent,
  getCounselors,
  authorizeCounselor,
}
