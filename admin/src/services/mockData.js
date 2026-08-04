/**
 * Mock 数据服务 - 开发阶段模拟云数据库返回
 * 部署后切换到真实云函数调用
 */
import dayjs from 'dayjs'

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateUsers(count = 50) {
  const mbtiTypes = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP']
  const enneagramTypes = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const users = []
  for (let i = 0; i < count; i++) {
    users.push({
      _id: `user_${i + 1}`,
      nickname: `用户${i + 1}`,
      mbtiType: mbtiTypes[randomInt(0, 15)],
      enneagramType: enneagramTypes[randomInt(0, 8)],
      assessmentCount: randomInt(1, 5),
      lastActive: dayjs().subtract(randomInt(0, 30), 'day').format('YYYY-MM-DD HH:mm'),
      createdAt: dayjs().subtract(randomInt(0, 90), 'day').format('YYYY-MM-DD HH:mm'),
      status: randomInt(0, 10) > 8 ? 'risk' : 'normal',
    })
  }
  return users
}

function generateAssessments(count = 30) {
  const mbtiTypes = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP']
  const records = []
  for (let i = 0; i < count; i++) {
    records.push({
      _id: `assessment_${i + 1}`,
      userId: `user_${randomInt(1, 50)}`,
      mbtiType: mbtiTypes[randomInt(0, 15)],
      enneagramType: `${randomInt(1, 9)}w${randomInt(1, 9)}`,
      subtype: ['sp', 'sx', 'so'][randomInt(0, 2)],
      confidence: (randomInt(60, 95) / 100).toFixed(2),
      totalRounds: randomInt(10, 18),
      riskLevel: ['low', 'low', 'low', 'low', 'medium', 'high'][randomInt(0, 5)],
      assessmentDate: dayjs().subtract(randomInt(0, 30), 'day').format('YYYY-MM-DD HH:mm'),
    })
  }
  return records
}

const allUsers = generateUsers(50)
const allAssessments = generateAssessments(30)

export const mockDataService = {
  getOverview() {
    return {
      totalUsers: 1280,
      totalAssessments: 3420,
      todayAssessments: randomInt(15, 45),
      monthlyActive: 856,
      riskAlerts: randomInt(3, 12),
      cacheHitRate: 0.73,
      typeDistribution: {
        'NT': 320, 'NF': 410, 'SJ': 280, 'SP': 270,
      },
    }
  },

  getUsers({ page = 1, pageSize = 20, search = '' }) {
    let filtered = allUsers
    if (search) {
      filtered = allUsers.filter(u => u.nickname.includes(search) || u.mbtiType.includes(search))
    }
    const start = (page - 1) * pageSize
    return {
      data: filtered.slice(start, start + pageSize),
      total: filtered.length,
    }
  },

  getUserDetail({ userId }) {
    const user = allUsers.find(u => u._id === userId) || allUsers[0]
    // 返回用户信息 + 该用户的测定记录
    const userAssessments = allAssessments.filter(a => a.userId === user._id)
    return { ...user, recentAssessments: userAssessments }
  },

  getAssessments({ page = 1, pageSize = 20, riskLevel = '', userId = '' }) {
    let filtered = allAssessments
    if (riskLevel) {
      filtered = allAssessments.filter(a => a.riskLevel === riskLevel)
    }
    if (userId) {
      filtered = allAssessments.filter(a => a.userId === userId)
    }
    const start = (page - 1) * pageSize
    return {
      data: filtered.slice(start, start + pageSize),
      total: filtered.length,
    }
  },

  getAssessmentDetail({ id }) {
    const record = allAssessments.find(a => a._id === id) || allAssessments[0]
    return {
      ...record,
      conversation: [
        { role: 'user', content: '最近一直在想，我是不是不太合群...', timestamp: 0 },
        { role: 'assistant', content: '能多说说吗？什么样的感觉让你觉得不太合群？', timestamp: 1, internalNote: '初步Fi信号' },
        { role: 'user', content: '就是大家聊的话题我总觉得没意思，我更在意那些深层次的东西', timestamp: 2 },
        { role: 'assistant', content: '那种"深层次的东西"能举个例子吗？', timestamp: 3, internalNote: 'Ni信号+4号动机信号' },
      ],
      functionAnalysis: {
        'Ni': { score: 8.5, rank: 1, confidence: 0.88, evidence: [{ quote: '更在意深层次的东西', interpretation: 'Ni收敛性思维', round: 2 }] },
        'Fe': { score: 7.2, rank: 2, confidence: 0.80, evidence: [{ quote: '不太合群', interpretation: 'Fe关注群体但感疏离', round: 0 }] },
        'Ti': { score: 5.1, rank: 3, confidence: 0.65, evidence: [] },
        'Se': { score: 2.3, rank: 4, confidence: 0.70, evidence: [] },
      },
      enneagramAnalysis: {
        mainType: 4, wing: 5, subtype: 'sx', confidence: 0.82,
        coreFear: '缺乏自我认同与独特性',
        coreDesire: '找到真实的自我',
        evidence: [{ quote: '大家聊的我总觉得没意思', interpretation: '4号独特性追求', round: 2 }],
      },
      dimensionAnalysis: {
        EI: { E: 0.3, I: 0.7, confidence: 0.85 },
        SN: { S: 0.2, N: 0.8, confidence: 0.90 },
        TF: { T: 0.4, F: 0.6, confidence: 0.75 },
        JP: { J: 0.65, P: 0.35, confidence: 0.70 },
      },
      riskAssessment: { level: 'low', flags: [], notes: '正常范围' },
      analystNote: 'Ni-Fe 轴明显，4w5 sx 副型强化了内省深度。用户有一定疏离感但无危机信号。',
    }
  },

  getRelations({ page = 1, pageSize = 20 }) {
    const relations = []
    for (let i = 0; i < 15; i++) {
      relations.push({
        _id: `rel_${i + 1}`,
        cacheKey: `INFJ_4w5sx_ENFP_7w6so`,
        profile1: { mbti: 'INFJ', enneagram: '4w5', subtype: 'sx' },
        profile2: { mbti: 'ENFP', enneagram: '7w6', subtype: 'so' },
        relationType: ['深层共鸣', '互补成长', '新奇探索', '需磨合'][randomInt(0, 3)],
        hitCount: randomInt(1, 50),
        generatedAt: dayjs().subtract(randomInt(0, 30), 'day').format('YYYY-MM-DD'),
      })
    }
    return { data: relations.slice((page - 1) * pageSize, page * pageSize), total: 15 }
  },

  getCacheStats() {
    return {
      totalCached: 342,
      hitRate: 0.73,
      avgGenerateTime: 2.8,
      topCombos: [
        { combo: 'INFJ_4w5sx × ENFP_7w6so', hits: 28 },
        { combo: 'INTP_5w4sp × ENTJ_8w7sx', hits: 19 },
        { combo: 'INFP_4w5sx × ENFJ_2w3so', hits: 15 },
      ],
    }
  },

  getMbtiDistribution() {
    return [
      { name: 'INTJ', value: 45 }, { name: 'INTP', value: 52 },
      { name: 'ENTJ', value: 28 }, { name: 'ENTP', value: 41 },
      { name: 'INFJ', value: 68 }, { name: 'INFP', value: 72 },
      { name: 'ENFJ', value: 35 }, { name: 'ENFP', value: 58 },
      { name: 'ISTJ', value: 32 }, { name: 'ISFJ', value: 38 },
      { name: 'ESTJ', value: 22 }, { name: 'ESFJ', value: 30 },
      { name: 'ISTP', value: 26 }, { name: 'ISFP', value: 34 },
      { name: 'ESTP', value: 18 }, { name: 'ESFP', value: 25 },
    ]
  },

  getEnneagramDistribution() {
    return [
      { name: '1号', value: 42 }, { name: '2号', value: 55 },
      { name: '3号', value: 38 }, { name: '4号', value: 68 },
      { name: '5号', value: 51 }, { name: '6号', value: 44 },
      { name: '7号', value: 39 }, { name: '8号', value: 27 },
      { name: '9号', value: 48 },
    ]
  },

  getDailyActivity({ days = 30 }) {
    const data = []
    for (let i = days - 1; i >= 0; i--) {
      data.push({
        date: dayjs().subtract(i, 'day').format('MM-DD'),
        assessments: randomInt(10, 50),
        newUsers: randomInt(2, 15),
      })
    }
    return data
  },

  getRiskAlerts({ level = '' }) {
    const alerts = []
    const levels = level ? [level] : ['medium', 'high']
    for (let i = 0; i < 8; i++) {
      alerts.push({
        _id: `risk_${i + 1}`,
        userId: `user_${randomInt(1, 50)}`,
        level: levels[randomInt(0, levels.length - 1)],
        trigger: ['自伤相关表达', '极度消极情绪', '社交隔离信号'][randomInt(0, 2)],
        assessmentId: `assessment_${randomInt(1, 30)}`,
        triggeredAt: dayjs().subtract(randomInt(0, 7), 'day').format('YYYY-MM-DD HH:mm'),
        status: ['pending', 'handled', 'escalated'][randomInt(0, 2)],
      })
    }
    return { data: alerts, total: alerts.length }
  },

  getLearningContent() {
    return {
      data: [
        { _id: 'l1_1', level: 1, title: '什么是 MBTI？四维度简介', isFree: true, views: 580 },
        { _id: 'l2_1', level: 2, title: '感知 vs 判断：信息如何进入大脑', isFree: true, views: 420 },
        { _id: 'l3_1', level: 3, title: 'Se/Si：你如何感知世界', isFree: false, views: 310 },
        { _id: 'l4_1', level: 4, title: '主导/辅助/第三/劣势的运作机制', isFree: false, views: 180 },
        { _id: 'l5_1', level: 5, title: '四个影子功能的含义', isFree: false, views: 95 },
        { _id: 'l6_1', level: 6, title: '不同功能栈的沟通方式', isFree: false, views: 72 },
      ],
      total: 6,
    }
  },

  updateLearningContent({ id, data }) {
    return { success: true }
  },

  getCounselors() {
    return {
      data: [
        { _id: 'c1', name: '张咨询师', license: 'PSY-2024-001', authorizedUsers: 12, status: 'active' },
        { _id: 'c2', name: '李咨询师', license: 'PSY-2024-002', authorizedUsers: 8, status: 'active' },
        { _id: 'c3', name: '王咨询师', license: 'PSY-2024-003', authorizedUsers: 0, status: 'pending' },
      ],
      total: 3,
    }
  },

  authorizeCounselor({ counselorId, data }) {
    return { success: true }
  },
}
