const app = getApp()
const { MBTI_TYPES, MBTI_GROUPS } = require('../../utils/constants')
const { getNotes, TOPIC_LIST, toggleLike, formatTime, getGroupInfo } = require('../../utils/noteData')
const analytics = require('../../utils/analytics')

Page({
  data: {
    statusBarHeight: 44,
    headerHeight: 88,
    topics: TOPIC_LIST,
    currentTopic: 'moment',
    showTypeFilter: false,
    currentMbtiFilter: '',
    mbtiGroups: [],
    notes: [],
    page: 1,
    hasMore: true,
    loading: false,
    refreshing: false,
    isEmpty: false,
    isMomentTab: true,
    isFeaturedTab: false
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      headerHeight: app.globalData.headerHeight
    })
    this.buildMbtiGroups()
    this.loadNotes(true)
    analytics.trackPageView('discover', { defaultTab: 'moment' })
  },

  onShow() {
    this.loadNotes(true)
  },

  buildMbtiGroups() {
    const groups = Object.keys(MBTI_GROUPS).map(key => ({
      key,
      name: MBTI_GROUPS[key].name,
      color: MBTI_GROUPS[key].color,
      types: MBTI_GROUPS[key].types
    }))
    this.setData({ mbtiGroups: groups })
  },

  _formatNote(note) {
    const isMicro = note.noteKind === 'micro' || note.topic === 'moment'
    const isFeatured = note.isSample && this.data.currentTopic === 'featured'
    let matchLabel = ''
    if (isMicro && note.matchContext) {
      const ctx = note.matchContext
      matchLabel = `${ctx.myType || ''} × ${ctx.friendType || ''}${ctx.relationName ? ' · ' + ctx.relationName : ''}`
    }
    return {
      ...note,
      timeText: formatTime(note.createTime),
      groupInfo: getGroupInfo(note.author.mbtiType),
      isMicro,
      isFeatured,
      matchLabel,
      contentPreview: note.content.length > (isMicro ? 80 : 100)
        ? note.content.substring(0, isMicro ? 80 : 100) + '...'
        : note.content
    }
  },

  loadNotes(reset = false) {
    if (this.data.loading) return

    const page = reset ? 1 : this.data.page
    const { currentTopic } = this.data
    this.setData({
      loading: true,
      isMomentTab: currentTopic === 'moment',
      isFeaturedTab: currentTopic === 'featured'
    })

    setTimeout(() => {
      const result = getNotes({
        topic: currentTopic,
        mbtiType: this.data.currentMbtiFilter,
        page,
        pageSize: 10
      })

      const formattedNotes = result.list.map((note) => this._formatNote(note))

      if (reset) {
        this.setData({
          notes: formattedNotes,
          page: 2,
          hasMore: result.hasMore,
          loading: false,
          refreshing: false,
          isEmpty: formattedNotes.length === 0
        })
      } else {
        this.setData({
          notes: [...this.data.notes, ...formattedNotes],
          page: page + 1,
          hasMore: result.hasMore,
          loading: false,
          isEmpty: false
        })
      }
    }, 200)
  },

  onPullDownRefresh() {
    this.setData({ refreshing: true })
    this.loadNotes(true)
    wx.stopPullDownRefresh()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadNotes(false)
    }
  },

  onTopicChange(e) {
    const { key } = e.currentTarget.dataset
    if (key === this.data.currentTopic) return
    this.setData({ currentTopic: key, currentMbtiFilter: '' })
    this.loadNotes(true)
  },

  toggleTypeFilter() {
    if (this.data.currentTopic === 'moment' || this.data.currentTopic === 'featured') return
    this.setData({ showTypeFilter: !this.data.showTypeFilter })
  },

  onMbtiFilter(e) {
    const { type } = e.currentTarget.dataset
    const current = this.data.currentMbtiFilter
    this.setData({
      currentMbtiFilter: current === type ? '' : type,
      showTypeFilter: false
    })
    this.loadNotes(true)
  },

  clearMbtiFilter() {
    this.setData({ currentMbtiFilter: '', showTypeFilter: false })
    this.loadNotes(true)
  },

  onNoteTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/note-detail/note-detail?id=${id}`
    })
  },

  onLikeTap(e) {
    const { id, index } = e.currentTarget.dataset
    const isLiked = toggleLike(id)
    const notes = this.data.notes
    const note = notes[index]
    if (note) {
      note.isLiked = isLiked
      note.likes = Math.max(0, note.likes + (isLiked ? 1 : -1))
      this.setData({ [`notes[${index}]`]: note })
    }
  },

  goMatch() {
    const type = app.globalData.myType
    if (type) {
      wx.navigateTo({ url: `/pages/invite/invite?type=${type}` })
    } else {
      wx.navigateTo({ url: '/pages/quick-test/quick-test?from=discover' })
    }
  },

  goFeatured() {
    this.setData({ currentTopic: 'featured' })
    this.loadNotes(true)
  },

  onShareAppMessage() {
    return {
      title: 'MBTI Match — 发现关系瞬间与精选内容',
      path: '/pages/discover/discover'
    }
  }
})
