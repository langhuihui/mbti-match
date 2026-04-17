const app = getApp()
const { MBTI_TYPES, COGNITIVE_FUNCTIONS, FUNCTION_POSITIONS, RELATIONSHIP_TYPES, COLLISION_TYPES } = require('../../utils/constants')
const { getMbtiRelation } = require('../../utils/mbtiRelations')

Page({
  data: {
    statusBarHeight: 44,
    headerHeight: 88,
    type1: '',
    type2: '',
    type1Info: null,
    type2Info: null,
    // 关系数据
    relation: null,
    isSymmetric: true,
    forwardRelation: '',
    backwardRelation: '',
    // 八维碰撞分析
    collisions: [],
    collisionSummary: { resonance: 0, complement: 0, clash: 0, weave: 0 },
    // 功能对比
    functionPairs: []
  },

  onLoad(options) {
    const { type1, type2 } = options
    if (!type1 || !type2 || !MBTI_TYPES[type1] || !MBTI_TYPES[type2]) {
      wx.navigateBack()
      return
    }

    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      headerHeight: app.globalData.headerHeight
    })

    this.analyzeRelation(type1, type2)
  },

  analyzeRelation(type1, type2) {
    const type1Info = MBTI_TYPES[type1]
    const type2Info = MBTI_TYPES[type2]

    // 关系判定
    const forward = getMbtiRelation(type1, type2)
    const backward = getMbtiRelation(type2, type1)
    const isSymmetric = forward === backward
    const relation = RELATIONSHIP_TYPES[forward] || {
      emoji: '?', name: forward, subtitle: '', desc: '', detail: '', color: '#64748b', level: 3
    }

    // 八维碰撞分析
    const fn1 = type1Info.functions
    const fn2 = type2Info.functions
    const collisions = []
    const summary = { resonance: 0, complement: 0, clash: 0, weave: 0 }

    for (let i = 0; i < 8; i++) {
      const code1 = fn1[i]
      const code2 = fn2[i]
      const func1 = COGNITIVE_FUNCTIONS[code1]
      const func2 = COGNITIVE_FUNCTIONS[code2]
      const pos = FUNCTION_POSITIONS[i]

      let collisionType = 'weave'

      if (code1 === code2) {
        // 同位置相同功能 = 共鸣
        collisionType = 'resonance'
      } else {
        // 检查是否是对立功能（如Ti vs Te, Fi vs Fe, Ni vs Ne, Si vs Se）
        const base1 = code1[0]
        const base2 = code2[0]
        const dir1 = code1[1]
        const dir2 = code2[1]
        if (base1 === base2 && dir1 !== dir2) {
          collisionType = 'clash'
        } else {
          // 检查互补（一方的强势对应另一方的弱势）
          const otherIdx = fn2.indexOf(code1)
          if (i < 4 && otherIdx >= 4) {
            collisionType = 'complement'
          } else if (i >= 4 && otherIdx < 4 && otherIdx >= 0) {
            collisionType = 'complement'
          }
        }
      }

      summary[collisionType]++
      const ct = COLLISION_TYPES[collisionType]

      collisions.push({
        position: i + 1,
        posName: pos.name,
        code1,
        code2,
        name1: func1 ? func1.name : code1,
        name2: func2 ? func2.name : code2,
        color1: func1 ? func1.color : '#64748b',
        color2: func2 ? func2.color : '#64748b',
        collisionType,
        collisionName: ct.name,
        collisionEmoji: ct.emoji,
        collisionColor: ct.color,
        isShadow: i >= 4
      })
    }

    // 功能对比对（前4个主要功能）
    const functionPairs = []
    for (let i = 0; i < 4; i++) {
      const code1 = fn1[i]
      const code2 = fn2[i]
      functionPairs.push({
        position: i + 1,
        posName: FUNCTION_POSITIONS[i].name,
        code1,
        code2,
        name1: COGNITIVE_FUNCTIONS[code1] ? COGNITIVE_FUNCTIONS[code1].name : code1,
        name2: COGNITIVE_FUNCTIONS[code2] ? COGNITIVE_FUNCTIONS[code2].name : code2,
        color1: COGNITIVE_FUNCTIONS[code1] ? COGNITIVE_FUNCTIONS[code1].color : '#64748b',
        color2: COGNITIVE_FUNCTIONS[code2] ? COGNITIVE_FUNCTIONS[code2].color : '#64748b',
        same: code1 === code2
      })
    }

    // 生成兼容度星星
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push({ filled: i < relation.level })
    }

    this.setData({
      type1,
      type2,
      type1Info,
      type2Info,
      relation: { ...relation, stars },
      isSymmetric,
      forwardRelation: forward,
      backwardRelation: backward,
      collisions,
      collisionSummary: summary,
      functionPairs
    })
  },

  // 查看名片
  viewCard(e) {
    const { type } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/card/card?type=${type}` })
  },

  // 邀请好友
  goInvite() {
    wx.navigateTo({ url: `/pages/invite/invite?type=${this.data.type1}` })
  },

  goBack() {
    wx.navigateBack()
  },

  goHome() {
    wx.reLaunch({ url: '/pages/index/index' })
  },

  onShareAppMessage() {
    const { type1, type2, relation } = this.data
    const userInfo = app.globalData.userInfo
    const nickname = userInfo ? userInfo.nickname : ''
    
    return {
      title: `${relation.emoji} ${nickname ? nickname + '发现：' : ''}${type1} × ${type2} 的关系是「${relation.name}」！`,
      path: `/pages/index/index`,
      withShareTicket: true
    }
  },

  onShareTimeline() {
    const { type1, type2, relation } = this.data
    return {
      title: `${type1} × ${type2} = ${relation.name}！你们是什么关系？`
    }
  }
})
