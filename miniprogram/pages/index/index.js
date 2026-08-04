const app = getApp()
const { MBTI_TYPES } = require('../../utils/constants')

Page({
  data: {
    statusBarHeight: 44,
    myType: '',
    myTypeInfo: null,
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 44
    })
    this.loadUserState()
  },

  onShow() {
    this.loadUserState()
  },

  loadUserState() {
    const myType = wx.getStorageSync('myMBTI') || app.globalData.myType || ''
    this.setData({
      myType,
      myTypeInfo: myType ? MBTI_TYPES[myType] : null
    })
  },

  // 进入对话测定
  goChatAssessment() {
    wx.navigateTo({
      url: '/pages/chat-assessment/chat-assessment'
    })
  },

  // 查看结果
  goResult() {
    wx.navigateTo({
      url: '/pages/result/result?from=index'
    })
  },
})
