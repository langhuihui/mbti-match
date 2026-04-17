const app = getApp()
const { MBTI_TYPES, MBTI_GROUPS, COGNITIVE_FUNCTIONS, FUNCTION_POSITIONS, RELATIONSHIP_TYPES } = require('../../utils/constants')
const { getMbtiRelation } = require('../../utils/mbtiRelations')

Page({
  data: {
    statusBarHeight: 44,
    headerHeight: 88,
    // 邀请者信息
    inviterType: '',
    inviterInfo: null,
    inviterGroup: null,
    inviteCode: '',
    inviterNickname: '',
    inviterAvatar: '',
    // 我的信息
    userInfo: null,
    hasUserInfo: false,
    // 匹配流程
    step: 'select', // select / reveal
    // 我的选择
    selectMethod: 'grid',
    myType: '',
    myTypeInfo: null,
    personality: { E: false, N: false, F: false, J: false },
    typeGroups: [],
    switchItems: [
      { key: 'E', checked: 'E', unchecked: 'I', labelL: '内向 I', labelR: '外向 E' },
      { key: 'N', checked: 'N', unchecked: 'S', labelL: '感觉 S', labelR: '直觉 N' },
      { key: 'F', checked: 'F', unchecked: 'T', labelL: '思维 T', labelR: '情感 F' },
      { key: 'J', checked: 'J', unchecked: 'P', labelL: '知觉 P', labelR: '判断 J' }
    ],
    // 揭晓结果
    relation: null,
    showResult: false,
    revealAnimation: false
  },

  onLoad(options) {
    const inviterType = options.type || ''
    const inviteCode = options.code || ''
    const inviterNickname = options.nickname ? decodeURIComponent(options.nickname) : ''
    const inviterAvatar = options.avatar ? decodeURIComponent(options.avatar) : ''

    // 标记是否从分享进入（有邀请者类型说明来自分享链接）
    if (inviterType) {
      app.globalData.fromShare = true
    }

    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      headerHeight: app.globalData.headerHeight,
      userInfo: app.globalData.userInfo,
      hasUserInfo: app.globalData.hasUserInfo
    })

    if (inviterType && MBTI_TYPES[inviterType]) {
      const inviterInfo = MBTI_TYPES[inviterType]
      const inviterGroup = MBTI_GROUPS[inviterInfo.group]
      this.setData({
        inviterType,
        inviterInfo,
        inviterGroup,
        inviteCode,
        inviterNickname,
        inviterAvatar
      })
    }

    this.buildTypeGroups()
    this.updateMyType()
  },

  buildTypeGroups() {
    const groups = Object.keys(MBTI_GROUPS).map(key => {
      const group = MBTI_GROUPS[key]
      return {
        key,
        name: group.name,
        color: group.color,
        bgColor: group.bgColor,
        types: group.types.map(code => ({
          code,
          name: MBTI_TYPES[code].name,
          image: MBTI_TYPES[code].image
        }))
      }
    })
    this.setData({ typeGroups: groups })
  },

  getType(personality) {
    return (personality.E ? 'E' : 'I') +
      (personality.N ? 'N' : 'S') +
      (personality.F ? 'F' : 'T') +
      (personality.J ? 'J' : 'P')
  },

  updateMyType() {
    const type = this.getType(this.data.personality)
    this.setData({
      myType: type,
      myTypeInfo: MBTI_TYPES[type]
    })
  },

  switchMethod(e) {
    const { method } = e.currentTarget.dataset
    this.setData({ selectMethod: method })
  },

  onSwitchChange(e) {
    const { key } = e.currentTarget.dataset
    const personality = { ...this.data.personality }
    personality[key] = !personality[key]
    this.setData({ personality })
    this.updateMyType()
  },

  onGridSelect(e) {
    const { code } = e.currentTarget.dataset
    const personality = {
      E: code[0] === 'E',
      N: code[1] === 'N',
      F: code[2] === 'F',
      J: code[3] === 'J'
    }
    this.setData({ personality })
    this.updateMyType()
  },

  // 揭晓关系
  revealRelation() {
    const { inviterType, myType, inviterNickname, inviterAvatar } = this.data
    if (!inviterType || !myType) return

    const relationKey = getMbtiRelation(myType, inviterType)
    const relation = RELATIONSHIP_TYPES[relationKey] || {
      emoji: '?', name: relationKey, subtitle: '', desc: '', detail: '', color: '#64748b', level: 3
    }

    // 生成星级
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push({ filled: i < relation.level })
    }

    this.setData({
      step: 'reveal',
      relation: { ...relation, stars },
      revealAnimation: true
    })

    // 延迟显示结果
    setTimeout(() => {
      this.setData({ showResult: true })
    }, 800)

    // 保存匹配记录
    app.addMatchRecord({
      myType,
      friendType: inviterType,
      friendNickname: inviterNickname || inviterType,
      friendAvatar: inviterAvatar || '',
      relation: relation.name || relationKey
    })

    // 保存好友信息
    if (inviterNickname || inviterAvatar) {
      app.addFriend({
        id: this.data.inviteCode || `${inviterType}_${Date.now()}`,
        nickname: inviterNickname,
        avatarUrl: inviterAvatar,
        mbtiType: inviterType,
        matchDate: new Date().toISOString()
      })
    }

    // 保存我的MBTI
    app.saveMyMBTI(myType)
  },

  // 查看详细分析
  viewDetail() {
    const { inviterType, myType } = this.data
    wx.navigateTo({
      url: `/pages/result/result?type1=${myType}&type2=${inviterType}`
    })
  },

  // 我也要生成名片
  goMyCard() {
    wx.navigateTo({
      url: `/pages/card/card?type=${this.data.myType}`
    })
  },

  // 邀请TA也来测
  goInviteBack() {
    const { myType } = this.data
    app.saveMyMBTI(myType)
    wx.navigateTo({
      url: `/pages/invite/invite?type=${myType}`
    })
  },

  goBack() {
    if (this.data.step === 'reveal') {
      this.setData({ step: 'select', showResult: false, revealAnimation: false })
    } else {
      wx.navigateBack()
    }
  },

  goHome() {
    wx.reLaunch({ url: '/pages/index/index' })
  },

  onShareAppMessage() {
    const { myType, myTypeInfo, userInfo, hasUserInfo } = this.data
    const nickname = hasUserInfo ? userInfo.nickname : ''
    const avatarUrl = hasUserInfo ? userInfo.avatarUrl : ''
    const inviteCode = app.generateInviteCode(myType)
    
    let sharePath = `/pages/match/match?code=${inviteCode}&type=${myType}`
    if (nickname) {
      sharePath += `&nickname=${encodeURIComponent(nickname)}`
    }
    if (avatarUrl) {
      sharePath += `&avatar=${encodeURIComponent(avatarUrl)}`
    }
    
    return {
      title: `${nickname ? nickname + '是' : '我是'} ${myType}（${myTypeInfo ? myTypeInfo.name : ''}），来测测我们是什么关系？`,
      path: sharePath,
      withShareTicket: true
    }
  }
})
