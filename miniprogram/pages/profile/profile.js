const app = getApp()
const { MBTI_TYPES, MBTI_GROUPS } = require('../../utils/constants')

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
    // Tab 切换
    activeTab: 'history', // history / friends
    // 匹配记录
    matchHistory: [],
    hasMatchHistory: false,
    // 好友列表
    friends: [],
    hasFriends: false,
    // 统计数据
    stats: {
      matchCount: 0,
      friendCount: 0,
      typesTested: 0
    },
    // 弹窗
    showProfileModal: false
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      headerHeight: app.globalData.headerHeight
    })
    this.loadData()

    // 监听用户信息变更
    this._onUserInfoChange = (userInfo) => {
      this.setData({ userInfo, hasUserInfo: true })
    }
    app.onUserInfoChange(this._onUserInfoChange)
  },

  onShow() {
    this.loadData()
  },

  onUnload() {
    app.offUserInfoChange(this._onUserInfoChange)
  },

  loadData() {
    const hasUserInfo = app.globalData.hasUserInfo
    const userInfo = app.globalData.userInfo
    const myType = app.globalData.myType
    const myTypeInfo = myType ? MBTI_TYPES[myType] : null
    const myGroupInfo = myTypeInfo ? MBTI_GROUPS[myTypeInfo.group] : null

    // 匹配记录
    const matchHistory = (app.globalData.matchHistory || []).map(record => ({
      ...record,
      myTypeInfo: MBTI_TYPES[record.myType] || {},
      friendTypeInfo: MBTI_TYPES[record.friendType] || {},
      dateText: this._formatDate(record.date)
    }))

    // 好友列表
    const friends = (app.globalData.friends || []).map(friend => ({
      ...friend,
      typeInfo: MBTI_TYPES[friend.mbtiType] || {},
      groupInfo: friend.mbtiType && MBTI_TYPES[friend.mbtiType]
        ? MBTI_GROUPS[MBTI_TYPES[friend.mbtiType].group] || {}
        : {},
      dateText: this._formatDate(friend.matchDate)
    }))

    // 统计数据
    const uniqueTypes = new Set()
    matchHistory.forEach(r => {
      uniqueTypes.add(r.myType)
      uniqueTypes.add(r.friendType)
    })

    this.setData({
      hasUserInfo,
      userInfo,
      myType,
      myTypeInfo,
      myGroupInfo,
      matchHistory,
      hasMatchHistory: matchHistory.length > 0,
      friends,
      hasFriends: friends.length > 0,
      stats: {
        matchCount: matchHistory.length,
        friendCount: friends.length,
        typesTested: uniqueTypes.size
      }
    })
  },

  _formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return `${date.getMonth() + 1}/${date.getDate()}`
  },

  // Tab 切换
  switchTab(e) {
    const { tab } = e.currentTarget.dataset
    this.setData({ activeTab: tab })
  },

  // ====== 用户头像昵称获取 ======
  showProfileSetup() {
    this.setData({ showProfileModal: true })
  },

  hideProfileModal() {
    this.setData({ showProfileModal: false })
  },

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

  // ====== 操作 ======
  
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

  // 查看好友名片
  viewFriendCard(e) {
    const { index } = e.currentTarget.dataset
    const friend = this.data.friends[index]
    if (friend && friend.mbtiType) {
      wx.navigateTo({
        url: `/pages/card/card?type=${friend.mbtiType}`
      })
    }
  },

  // 删除匹配记录
  deleteMatchRecord(e) {
    const { index } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条匹配记录吗？',
      success: (res) => {
        if (res.confirm) {
          const history = app.globalData.matchHistory || []
          history.splice(index, 1)
          app.globalData.matchHistory = history
          try {
            wx.setStorageSync('matchHistory', history)
          } catch (e) { /* ignore */ }
          this.loadData()
          wx.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  },

  // 删除好友
  deleteFriend(e) {
    const { index } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这位好友记录吗？',
      success: (res) => {
        if (res.confirm) {
          const friends = app.globalData.friends || []
          friends.splice(index, 1)
          app.globalData.friends = friends
          try {
            wx.setStorageSync('friends', friends)
          } catch (e) { /* ignore */ }
          this.loadData()
          wx.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  },

  // 清空所有记录
  clearAllRecords() {
    wx.showModal({
      title: '清空所有记录',
      content: '此操作将清空所有匹配记录和好友列表，不可恢复。确认继续吗？',
      confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          app.globalData.matchHistory = []
          app.globalData.friends = []
          try {
            wx.setStorageSync('matchHistory', [])
            wx.setStorageSync('friends', [])
          } catch (e) { /* ignore */ }
          this.loadData()
          wx.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  },

  // 导航
  goMyCard() {
    const type = this.data.myType
    if (type) {
      wx.navigateTo({ url: `/pages/card/card?type=${type}` })
    } else {
      wx.navigateTo({ url: '/pages/test/test?mode=single' })
    }
  },

  goTest() {
    wx.navigateTo({ url: '/pages/test/test?mode=single' })
  },

  goInvite() {
    const type = this.data.myType
    if (type) {
      wx.navigateTo({ url: `/pages/invite/invite?type=${type}` })
    } else {
      wx.showToast({ title: '请先完成测试', icon: 'none' })
    }
  },

  goBack() {
    wx.navigateBack()
  },

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
  }
})
