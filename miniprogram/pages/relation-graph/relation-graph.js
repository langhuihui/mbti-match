const app = getApp()
const { MBTI_TYPES, MBTI_GROUPS } = require('../../utils/constants')
const { buildFromFriends, buildFromMatchHistory, buildStats } = require('../../utils/relationGraph')
const analytics = require('../../utils/analytics')

Page({
  data: {
    statusBarHeight: 44,
    headerHeight: 88,
    myType: '',
    myTypeInfo: null,
    myGroupInfo: null,
    userInfo: null,
    nodes: [],
    stats: null,
    hasGraph: false,
    graphSize: 640
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      headerHeight: app.globalData.headerHeight
    })
    analytics.trackPageView('relation-graph')
    this.loadGraph()
  },

  onShow() {
    this.loadGraph()
  },

  loadGraph() {
    const myType = app.globalData.myType
    const userInfo = app.globalData.userInfo
    const friends = app.globalData.friends || []
    const matchHistory = app.globalData.matchHistory || []

    if (!myType) {
      this.setData({ hasGraph: false, myType: '' })
      return
    }

    const myTypeInfo = MBTI_TYPES[myType]
    const myGroupInfo = myTypeInfo ? MBTI_GROUPS[myTypeInfo.group] : null

    let graph = buildFromFriends(myType, friends)
    if (!graph.nodes.length) {
      graph = buildFromMatchHistory(myType, matchHistory, userInfo)
    }

    const stats = buildStats(graph.nodes)

    this.setData({
      myType,
      myTypeInfo,
      myGroupInfo,
      userInfo,
      nodes: graph.nodes,
      stats,
      hasGraph: graph.nodes.length > 0
    })
  },

  onNodeTap(e) {
    const { index } = e.currentTarget.dataset
    const node = this.data.nodes[index]
    if (!node || !this.data.myType) return

    analytics.track('relation_graph_tap', {
      friendType: node.mbtiType,
      relation: node.relationName
    })

    wx.navigateTo({
      url: `/pages/result/result?type1=${this.data.myType}&type2=${node.mbtiType}`
    })
  },

  goInvite() {
    const type = this.data.myType
    if (type) {
      wx.navigateTo({ url: `/pages/invite/invite?type=${type}` })
    } else {
      wx.navigateTo({ url: '/pages/quick-test/quick-test?from=graph' })
    }
  },

  goTest() {
    wx.navigateTo({ url: '/pages/quick-test/quick-test?from=graph' })
  },

  goBack() {
    wx.navigateBack({
      fail: () => wx.switchTab({ url: '/pages/profile/profile' })
    })
  },

  onShareAppMessage() {
    const { myType, myTypeInfo, stats } = this.data
    const count = stats ? stats.total : 0
    if (myType && count > 0) {
      return {
        title: `我的关系星图已有 ${count} 位好友，来测测你和我是什么关系？`,
        path: '/pages/index/index',
        withShareTicket: true
      }
    }
    return {
      title: 'MBTI Match — 绘制你的人格关系星图',
      path: '/pages/index/index'
    }
  }
})
