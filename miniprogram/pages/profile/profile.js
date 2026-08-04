const app = getApp()
const { MBTI_TYPES, MBTI_GROUPS } = require('../../utils/constants')
const userService = require('../../utils/userService')

Page({
  data: {
    statusBarHeight: 44,
    headerHeight: 88,
    hasUserInfo: false,
    userInfo: null,
    myType: '',
    myTypeInfo: null,
    myGroupInfo: null,
    stats: {
      assessmentCount: 0,
      matchCount: 0
    },
    assessmentHistory: [],
    showProfileModal: false
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      headerHeight: app.globalData.headerHeight
    })

    this._onUserInfoChange = (userInfo) => {
      this.setData({ userInfo, hasUserInfo: true })
    }
    app.onUserInfoChange(this._onUserInfoChange)
  },

  onShow() {
    this.loadUserState()
    this.loadHistory()
  },

  onUnload() {
    if (this._onUserInfoChange) {
      app.offUserInfoChange?.(this._onUserInfoChange)
    }
  },

  loadUserState() {
    const myType = wx.getStorageSync('myMBTI') || app.globalData.myType || ''
    const userInfo = app.globalData.userInfo || {}
    this.setData({
      myType,
      myTypeInfo: myType ? MBTI_TYPES[myType] : null,
      myGroupInfo: myType ? this.getGroupInfo(myType) : null,
      userInfo,
      hasUserInfo: !!userInfo.nickname
    })
  },

  getGroupInfo(type) {
    const groups = { NT: ['INTJ','INTP','ENTJ','ENTP'], NF: ['INFJ','INFP','ENFJ','ENFP'], SJ: ['ISTJ','ISFJ','ESTJ','ESFJ'], SP: ['ISTP','ISFP','ESTP','ESFP'] }
    const group = Object.keys(groups).find(g => groups[g].includes(type))
    return MBTI_GROUPS[group] || null
  },

  loadHistory() {
    // 从本地存储读取测定历史
    const history = wx.getStorageSync('assessmentHistory') || []
    const assessmentCount = wx.getStorageSync('assessmentCount') || (history.length > 0 ? history.length : (this.data.myType ? 1 : 0))
    const matchCount = wx.getStorageSync('matchCount') || 0

    this.setData({
      assessmentHistory: history,
      stats: { assessmentCount, matchCount }
    })
  },

  goTest() {
    wx.navigateTo({ url: '/pages/chat-assessment/chat-assessment' })
  },

  goResult() {
    wx.navigateTo({ url: '/pages/result/result?from=profile' })
  },

  goResultDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/result/result?from=history&id=${id}` })
  },

  goRelationGraph() {
    wx.navigateTo({ url: '/pages/relation-graph/relation-graph' })
  },

  goPrivacy() {
    wx.navigateTo({ url: '/pages/privacy/privacy' })
  },

  showProfileSetup() {
    if (this.data.showProfileModal) return
    this.setData({ showProfileModal: true })
    wx.showActionSheet({
      itemList: ['选择头像', '修改昵称'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.chooseAvatar()
        } else if (res.tapIndex === 1) {
          this.editNickname()
        }
      },
      complete: () => {
        this.setData({ showProfileModal: false })
      }
    })
  },

  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const avatarUrl = res.tempFiles[0].tempFilePath
        const userInfo = { ...this.data.userInfo, avatarUrl }
        app.setUserInfo?.(userInfo)
        this.setData({ userInfo, hasUserInfo: true })
        wx.setStorageSync('userInfo', userInfo)
      }
    })
  },

  editNickname() {
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入昵称',
      content: this.data.userInfo?.nickname || '',
      success: (res) => {
        if (res.confirm && res.content) {
          const userInfo = { ...this.data.userInfo, nickname: res.content }
          app.setUserInfo?.(userInfo)
          this.setData({ userInfo, hasUserInfo: true })
          wx.setStorageSync('userInfo', userInfo)
        }
      }
    })
  },

  onShareAppMessage() {
    return {
      title: 'MBTI Match - 通过 AI 对话发现你的认知密码',
      path: '/pages/index/index'
    }
  }
})
