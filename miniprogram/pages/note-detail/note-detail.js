const app = getApp()
const { MBTI_TYPES, MBTI_GROUPS } = require('../../utils/constants')
const { getNoteById, toggleLike, toggleFavorite, formatTime, getGroupInfo } = require('../../utils/noteData')

Page({
  data: {
    statusBarHeight: 44,
    headerHeight: 88,
    note: null,
    notFound: false,
    // 评论（Phase 0: 本地模拟）
    comments: [],
    commentInput: '',
    showCommentInput: false
  },

  onLoad(options) {
    const { id } = options
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      headerHeight: app.globalData.headerHeight
    })

    if (!id) {
      this.setData({ notFound: true })
      return
    }

    this.noteId = id
    this.loadNote(id)
  },

  onShow() {
    if (this.noteId) {
      this.loadNote(this.noteId)
    }
  },

  loadNote(id) {
    const note = getNoteById(id)
    if (!note) {
      this.setData({ notFound: true })
      return
    }

    const groupInfo = getGroupInfo(note.author.mbtiType)
    const isMicro = note.noteKind === 'micro' || note.topic === 'moment'
    let matchLabel = ''
    if (isMicro && note.matchContext) {
      const ctx = note.matchContext
      matchLabel = `${ctx.myType || ''} × ${ctx.friendType || ''}${ctx.relationName ? ' · ' + ctx.relationName : ''}`
    }

    this.setData({
      note: {
        ...note,
        timeText: formatTime(note.createTime),
        groupInfo,
        typeInfo: MBTI_TYPES[note.author.mbtiType] || null,
        isMicro,
        matchLabel
      }
    })

    // 加载评论（Phase 0: 从本地存储）
    this.loadComments(id)
  },

  loadComments(noteId) {
    try {
      const allComments = wx.getStorageSync('mbti_comments') || {}
      const comments = (allComments[noteId] || []).map(c => ({
        ...c,
        timeText: formatTime(c.createTime),
        groupInfo: getGroupInfo(c.mbtiType)
      }))
      this.setData({ comments })
    } catch (e) {
      this.setData({ comments: [] })
    }
  },

  // 点赞
  onLike() {
    if (!this.data.note) return
    const isLiked = toggleLike(this.data.note.id)
    const note = this.data.note
    note.isLiked = isLiked
    note.likes = Math.max(0, note.likes + (isLiked ? 1 : -1))
    this.setData({ note })
  },

  // 收藏
  onFavorite() {
    if (!this.data.note) return
    const isFavorited = toggleFavorite(this.data.note.id)
    const note = this.data.note
    note.isFavorited = isFavorited
    this.setData({ note })
    wx.showToast({
      title: isFavorited ? '已收藏' : '取消收藏',
      icon: 'none'
    })
  },

  // 显示评论输入
  showCommentBox() {
    this.setData({ showCommentInput: true })
  },

  hideCommentBox() {
    this.setData({ showCommentInput: false })
  },

  onCommentInput(e) {
    this.setData({ commentInput: e.detail.value })
  },

  // 发送评论
  sendComment() {
    const content = this.data.commentInput.trim()
    if (!content) {
      wx.showToast({ title: '请输入评论', icon: 'none' })
      return
    }

    const userInfo = app.globalData.userInfo || {}
    const myType = app.globalData.myType || ''

    const comment = {
      id: 'c_' + Date.now().toString(36),
      content,
      nickname: userInfo.nickname || '匿名用户',
      avatarUrl: userInfo.avatarUrl || '',
      mbtiType: myType,
      createTime: new Date().toISOString()
    }

    // 保存到本地
    try {
      const allComments = wx.getStorageSync('mbti_comments') || {}
      if (!allComments[this.noteId]) {
        allComments[this.noteId] = []
      }
      allComments[this.noteId].unshift(comment)
      wx.setStorageSync('mbti_comments', allComments)
    } catch (e) {
      console.warn('保存评论失败', e)
    }

    // 更新UI
    const comments = [
      {
        ...comment,
        timeText: formatTime(comment.createTime),
        groupInfo: getGroupInfo(myType)
      },
      ...this.data.comments
    ]

    const note = this.data.note
    note.comments = comments.length

    this.setData({
      comments,
      note,
      commentInput: '',
      showCommentInput: false
    })

    wx.showToast({ title: '评论成功', icon: 'none' })
  },

  // 查看作者名片
  viewAuthorCard() {
    const mbtiType = this.data.note?.author?.mbtiType
    if (mbtiType) {
      wx.navigateTo({
        url: `/pages/card/card?type=${mbtiType}`
      })
    }
  },

  goBack() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({ url: '/pages/discover/discover' })
      }
    })
  },

  onShareAppMessage() {
    const note = this.data.note
    if (!note) return { title: 'MBTI Match 人格笔记' }

    return {
      title: note.title || `${note.author.nickname}(${note.author.mbtiType})的人格笔记`,
      path: `/pages/note-detail/note-detail?id=${note.id}`
    }
  }
})
