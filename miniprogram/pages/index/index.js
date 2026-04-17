const app = getApp()
const { MBTI_TYPES, MBTI_GROUPS, MBTI_TYPE_ORDER } = require('../../utils/constants')

const DEFAULT_AVATAR = '/images/default-avatar.svg'

Page({
  data: {
    statusBarHeight: 44,
    headerHeight: 88,
    // 用户信息
    hasUserInfo: false,
    userInfo: null,
    myType: '',
    myTypeInfo: null,
    myGroupInfo: null,
    // 好友记录
    matchHistory: [],
    hasMatchHistory: false,
    fromGroup: false,
    // 功能入口
    features: [
      { icon: '八维', title: '八维认知', desc: '基于荣格认知功能理论' },
      { icon: '15', title: '15种关系', desc: '精准解读人际化学反应' },
      { icon: '卡片', title: '人格名片', desc: '生成专属人格卡片分享' },
      { icon: '双人', title: '双人匹配', desc: '邀请好友揭秘你们的关系' }
    ],
    groups: [],
    showScrollHint: true,
    // 设置头像昵称弹窗
    showProfileModal: false,
    // 邀请码输入弹窗
    showInviteCodeModal: false,
    inputInviteCode: ''
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      headerHeight: app.globalData.headerHeight
    })
    this.buildGroups()
    this.loadUserState()
    
    // 监听用户信息变更
    this._onUserInfoChange = (userInfo) => {
      this.setData({
        userInfo,
        hasUserInfo: true
      })
    }
    app.onUserInfoChange(this._onUserInfoChange)
  },

  onShow() {
    // 每次显示刷新用户状态
    this.loadUserState()
    
    // 首次进入引导：延迟1.5秒自动弹出头像昵称设置弹窗
    if (app.globalData.needProfileSetup && !this.data.hasUserInfo) {
      app.globalData.needProfileSetup = false // 只触发一次
      setTimeout(() => {
        if (!this.data.hasUserInfo) {
          this.showProfileSetup()
        }
      }, 1500)
    }
    
    // 3秒后隐藏滚动提示
    setTimeout(() => {
      this.setData({ showScrollHint: false })
    }, 3000)
  },

  onUnload() {
    app.offUserInfoChange(this._onUserInfoChange)
  },

  loadUserState() {
    const hasUserInfo = app.globalData.hasUserInfo
    const userInfo = app.globalData.userInfo
    const myType = app.globalData.myType
    const myTypeInfo = myType ? MBTI_TYPES[myType] : null
    const myGroupInfo = myTypeInfo ? MBTI_GROUPS[myTypeInfo.group] : null
    const fromGroup = app.globalData.fromGroup || false
    
    // 加载匹配记录
    const matchHistory = (app.globalData.matchHistory || []).slice(0, 5)
    
    this.setData({
      hasUserInfo,
      userInfo,
      myType,
      myTypeInfo,
      myGroupInfo,
      matchHistory,
      hasMatchHistory: matchHistory.length > 0,
      fromGroup
    })
  },

  buildGroups() {
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
          subtitle: MBTI_TYPES[code].subtitle,
          image: MBTI_TYPES[code].image
        }))
      }
    })
    this.setData({ groups })
  },

  // ====== 用户头像昵称获取 ======
  
  // 显示头像昵称设置弹窗
  showProfileSetup() {
    this.setData({ showProfileModal: true })
  },

  hideProfileModal() {
    this.setData({ showProfileModal: false })
  },

  // 组件确认保存用户信息
  onProfileConfirm(e) {
    const userInfo = e.detail
    
    app.saveUserInfo(userInfo)
    
    this.setData({
      showProfileModal: false,
      userInfo,
      hasUserInfo: true
    })

    wx.showToast({ title: '设置成功', icon: 'none' })
  },

  // ====== 邀请码输入 ======
  
  // 显示邀请码输入弹窗
  showInviteCodeInput() {
    this.setData({
      showInviteCodeModal: true,
      inputInviteCode: ''
    })
  },

  // 隐藏邀请码输入弹窗
  hideInviteCodeModal() {
    this.setData({ showInviteCodeModal: false })
  },

  // 邀请码输入
  onInviteCodeInput(e) {
    this.setData({ inputInviteCode: e.detail.value })
  },

  // 提交邀请码
  submitInviteCode() {
    const code = this.data.inputInviteCode.trim()
    if (!code) {
      wx.showToast({ title: '请输入邀请码', icon: 'none' })
      return
    }
    // 解析邀请码
    const parsed = app.parseInviteCode(code)
    if (!parsed || !parsed.type) {
      wx.showToast({ title: '邀请码无效', icon: 'none' })
      return
    }
    this.setData({ showInviteCodeModal: false })
    // 跳转到匹配页
    wx.navigateTo({
      url: `/pages/match/match?code=${code}&type=${parsed.type}`
    })
  },

  // ====== 导航 ======
  
  goProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' })
  },

  goTestSingle() {
    wx.navigateTo({ url: '/pages/test/test?mode=single' })
  },

  goTestDual() {
    wx.navigateTo({ url: '/pages/test/test?mode=dual' })
  },

  // 点击某个类型
  onTypeTap(e) {
    const { code } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/card/card?type=${code}` })
  },

  // 查看我的名片
  goMyCard() {
    const type = this.data.myType
    if (type) {
      wx.navigateTo({ url: `/pages/card/card?type=${type}` })
    } else {
      wx.navigateTo({ url: '/pages/test/test?mode=single' })
    }
  },

  // 查看匹配记录详情
  viewMatchDetail(e) {
    const { index } = e.currentTarget.dataset
    const record = this.data.matchHistory[index]
    if (record) {
      wx.navigateTo({
        url: `/pages/result/result?type1=${record.myType}&type2=${record.friendType}`
      })
    }
  },

  // ====== 微信分享 ======
  
  onShareAppMessage() {
    const { userInfo, myType, myTypeInfo } = this.data
    const nickname = userInfo?.nickname || ''
    
    if (myType && myTypeInfo) {
      return {
        title: `${nickname ? nickname + '是' : '我是'} ${myType}（${myTypeInfo.name}），来看看你是什么类型？`,
        path: '/pages/index/index',
        withShareTicket: true
      }
    }
    
    return {
      title: 'MBTI Match — 发现你的认知密码',
      path: '/pages/index/index',
      withShareTicket: true
    }
  },

  onShareTimeline() {
    const { myType, myTypeInfo } = this.data
    
    if (myType && myTypeInfo) {
      return {
        title: `我是 ${myType}（${myTypeInfo.name}），来测测你的人格类型！`
      }
    }
    
    return {
      title: 'MBTI Match — 基于八维认知功能的人格关系分析'
    }
  }
})
