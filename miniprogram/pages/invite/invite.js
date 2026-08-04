const app = getApp()
const { MBTI_TYPES, MBTI_GROUPS } = require('../../utils/constants')
const analytics = require('../../utils/analytics')
const { pickShareVariant, buildInviteShare, buildCopyText } = require('../../utils/inviteShare')

Page({
  data: {
    statusBarHeight: 44,
    headerHeight: 88,
    // 我的信息
    myType: '',
    myTypeInfo: null,
    myGroupInfo: null,
    userInfo: null,
    hasUserInfo: false,
    // 邀请信息
    inviteCode: '',
    shareVariant: 'curious',
    copied: false,
    // 流程步骤
    steps: [
      { num: '1', icon: '①', title: '选择你的类型', desc: '你已完成这一步！', done: true },
      { num: '2', icon: '②', title: '分享给好友', desc: '点击下方按钮分享', done: false },
      { num: '3', icon: '③', title: '好友选择类型', desc: '好友打开后选择TA的MBTI', done: false },
      { num: '4', icon: '④', title: '揭晓关系', desc: '查看你们的认知碰撞', done: false }
    ]
  },

  onLoad(options) {
    const type = options.type || app.globalData.myType || 'INFP'
    const typeInfo = MBTI_TYPES[type]
    const groupInfo = MBTI_GROUPS[typeInfo.group]
    const userInfo = app.globalData.userInfo
    const hasUserInfo = app.globalData.hasUserInfo

    // 生成邀请码
    const inviteCode = app.generateInviteCode(type)
    const shareVariant = pickShareVariant(inviteCode.length)

    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      headerHeight: app.globalData.headerHeight,
      myType: type,
      myTypeInfo: typeInfo,
      myGroupInfo: groupInfo,
      userInfo,
      hasUserInfo,
      inviteCode,
      shareVariant
    })

    // 保存到全局
    app.globalData.myType = type
    app.globalData.inviteCode = inviteCode
    app.saveMyMBTI(type)

    analytics.track(analytics.EVENTS.INVITE_SENT, {
      type,
      inviteCode,
      shareVariant
    })
    analytics.trackPageView('invite', { type })
  },

  // 复制邀请信息
  copyInvite() {
    const { myType, myTypeInfo, inviteCode, userInfo } = this.data
    const nickname = userInfo ? userInfo.nickname : ''
    const text = buildCopyText({
      nickname,
      myType,
      typeName: myTypeInfo.name,
      inviteCode
    })

    wx.setClipboardData({
      data: text,
      success: () => {
        this.setData({ copied: true })
        setTimeout(() => this.setData({ copied: false }), 2000)
      }
    })
  },

  goBack() {
    wx.navigateBack()
  },

  onShareAppMessage() {
    const { myType, myTypeInfo, inviteCode, userInfo, hasUserInfo, shareVariant } = this.data
    const nickname = hasUserInfo ? userInfo.nickname : ''
    const avatarUrl = hasUserInfo ? userInfo.avatarUrl : ''

    const share = buildInviteShare({
      nickname,
      myType,
      typeName: myTypeInfo.name,
      inviteCode,
      variant: shareVariant
    })

    let path = share.path
    if (avatarUrl) {
      path += `&avatar=${encodeURIComponent(avatarUrl)}`
    }

    analytics.track(analytics.EVENTS.SHARE, {
      page: 'invite',
      variant: share.variant
    })

    return {
      title: share.title,
      path,
      withShareTicket: true
    }
  },

  onShareTimeline() {
    const { myType, myTypeInfo, userInfo } = this.data
    const nickname = userInfo ? userInfo.nickname : '我'
    return {
      title: `${nickname}是 ${myType}（${myTypeInfo.name}），来测测你是什么类型？`
    }
  }
})
