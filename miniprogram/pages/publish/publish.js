const app = getApp()
const { MBTI_TYPES, MBTI_GROUPS } = require('../../utils/constants')
const { publishNote, TOPIC_LIST, checkContentSafety } = require('../../utils/noteData')
const analytics = require('../../utils/analytics')

Page({
  data: {
    statusBarHeight: 44,
    headerHeight: 88,
    // 表单数据
    title: '',
    content: '',
    images: [],
    selectedTopic: 'daily',
    selectedTags: [],
    // 话题列表（排除"全部"）
    topics: TOPIC_LIST.filter(t => t.key !== 'all'),
    // MBTI标签
    mbtiTags: [],
    customTags: [],
    customTagInput: '',
    // 发布状态
    publishing: false,
    // 字数统计
    titleCount: 0,
    contentCount: 0,
    maxTitle: 30,
    maxContent: 1000
  },

  onLoad() {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      headerHeight: app.globalData.headerHeight
    })
    this.buildMbtiTags()
  },

  buildMbtiTags() {
    // 根据用户的MBTI类型预设相关标签
    const myType = app.globalData.myType
    const tags = []
    
    if (myType && MBTI_TYPES[myType]) {
      tags.push(myType)
      const typeInfo = MBTI_TYPES[myType]
      // 添加主导和辅助功能作为可选标签
      if (typeInfo.functions && typeInfo.functions.length >= 2) {
        tags.push(typeInfo.functions[0], typeInfo.functions[1])
      }
      // 添加族群
      if (typeInfo.group && MBTI_GROUPS[typeInfo.group]) {
        tags.push(MBTI_GROUPS[typeInfo.group].name)
      }
    }
    
    // 通用标签
    const commonTags = ['日常', '深度解读', '关系', '成长', '职场', '趣事', '八维认知']
    
    this.setData({
      mbtiTags: tags,
      selectedTags: myType ? [myType] : []
    })
    this.setData({ commonTags })
  },

  // 标题输入
  onTitleInput(e) {
    const title = e.detail.value
    this.setData({
      title,
      titleCount: title.length
    })
  },

  // 内容输入
  onContentInput(e) {
    const content = e.detail.value
    this.setData({
      content,
      contentCount: content.length
    })
  },

  // 选择话题
  onTopicSelect(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ selectedTopic: key })
  },

  // 切换标签
  onTagToggle(e) {
    const { tag } = e.currentTarget.dataset
    const tags = [...this.data.selectedTags]
    const idx = tags.indexOf(tag)
    if (idx >= 0) {
      tags.splice(idx, 1)
    } else {
      if (tags.length >= 5) {
        wx.showToast({ title: '最多选择5个标签', icon: 'none' })
        return
      }
      tags.push(tag)
    }
    this.setData({ selectedTags: tags })
  },

  // 自定义标签输入
  onCustomTagInput(e) {
    this.setData({ customTagInput: e.detail.value })
  },

  // 添加自定义标签
  addCustomTag() {
    const tag = this.data.customTagInput.trim()
    if (!tag) return
    if (tag.length > 10) {
      wx.showToast({ title: '标签最长10个字', icon: 'none' })
      return
    }
    if (this.data.selectedTags.length >= 5) {
      wx.showToast({ title: '最多5个标签', icon: 'none' })
      return
    }
    if (this.data.selectedTags.includes(tag)) {
      wx.showToast({ title: '标签已存在', icon: 'none' })
      return
    }
    this.setData({
      selectedTags: [...this.data.selectedTags, tag],
      customTags: [...this.data.customTags, tag],
      customTagInput: ''
    })
  },

  // 选择图片
  chooseImage() {
    const remain = 9 - this.data.images.length
    if (remain <= 0) {
      wx.showToast({ title: '最多9张图片', icon: 'none' })
      return
    }
    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (res) => {
        const newImages = res.tempFiles.map(f => f.tempFilePath)
        this.setData({
          images: [...this.data.images, ...newImages]
        })
      }
    })
  },

  // 删除图片
  removeImage(e) {
    const { index } = e.currentTarget.dataset
    const images = [...this.data.images]
    images.splice(index, 1)
    this.setData({ images })
  },

  // 预览图片
  previewImage(e) {
    const { src } = e.currentTarget.dataset
    wx.previewImage({
      current: src,
      urls: this.data.images
    })
  },

  // 发布笔记
  async onPublish() {
    const { title, content, images, selectedTopic, selectedTags, publishing } = this.data
    
    if (publishing) return

    // 校验
    if (!content.trim()) {
      wx.showToast({ title: '请输入笔记内容', icon: 'none' })
      return
    }

    if (content.trim().length < 10) {
      wx.showToast({ title: '内容至少10个字', icon: 'none' })
      return
    }

    this.setData({ publishing: true })

    // 内容安全检查（本地 + 云 msgSecCheck）
    const titleCheck = await checkContentSafety(title)
    if (!titleCheck.safe) {
      wx.showToast({ title: titleCheck.reason, icon: 'none' })
      this.setData({ publishing: false })
      return
    }
    const contentCheck = await checkContentSafety(content)
    if (!contentCheck.safe) {
      wx.showToast({ title: contentCheck.reason, icon: 'none' })
      this.setData({ publishing: false })
      return
    }

    // 构建作者信息
    const userInfo = app.globalData.userInfo || {}
    const myType = app.globalData.myType || ''
    const typeInfo = myType ? MBTI_TYPES[myType] : null
    const groupKey = typeInfo ? typeInfo.group : ''

    const author = {
      nickname: userInfo.nickname || '匿名用户',
      avatarUrl: userInfo.avatarUrl || '',
      mbtiType: myType,
      mbtiGroup: groupKey
    }

    // 发布
    try {
      const note = publishNote({
        author,
        title: title.trim(),
        content: content.trim(),
        images, // Phase 0: 本地临时路径，Phase 1: 上传到云存储
        tags: selectedTags,
        topic: selectedTopic
      })

      analytics.track(analytics.EVENTS.NOTE_PUBLISHED, {
        topic: selectedTopic,
        tagCount: selectedTags.length,
        hasImages: images.length > 0
      })

      wx.showToast({ title: '发布成功！', icon: 'success' })

      // 延迟跳转到发现页
      setTimeout(() => {
        this.resetForm()
        wx.switchTab({ url: '/pages/discover/discover' })
      }, 1000)
    } catch (e) {
      wx.showToast({ title: '发布失败，请重试', icon: 'none' })
    } finally {
      this.setData({ publishing: false })
    }
  },

  // 重置表单
  resetForm() {
    this.setData({
      title: '',
      content: '',
      images: [],
      selectedTopic: 'daily',
      customTagInput: '',
      titleCount: 0,
      contentCount: 0
    })
    this.buildMbtiTags()
  },

  goBack() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({ url: '/pages/index/index' })
      }
    })
  }
})
