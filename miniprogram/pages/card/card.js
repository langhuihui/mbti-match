const app = getApp()
const { MBTI_TYPES, COGNITIVE_FUNCTIONS, FUNCTION_POSITIONS, MBTI_GROUPS } = require('../../utils/constants')

Page({
  data: {
    statusBarHeight: 44,
    headerHeight: 88,
    type: '',
    typeInfo: null,
    groupInfo: null,
    eightFunctions: [],
    // 用户信息
    userInfo: null,
    hasUserInfo: false,
    isMyCard: false, // 是否是我自己的名片
    // 名片主题
    themes: [
      { key: 'cosmos', name: '星空', colors: ['#1e1b4b', '#312e81', '#4338ca'] },
      { key: 'sunrise', name: '日出', colors: ['#7c2d12', '#c2410c', '#fb923c'] },
      { key: 'ocean', name: '海洋', colors: ['#0c4a6e', '#0369a1', '#38bdf8'] },
      { key: 'forest', name: '森林', colors: ['#14532d', '#15803d', '#4ade80'] },
      { key: 'sakura', name: '樱花', colors: ['#831843', '#be185d', '#f472b6'] },
      { key: 'aurora', name: '极光', colors: ['#064e3b', '#047857', '#34d399'] }
    ],
    currentTheme: 'cosmos',
    // Canvas
    canvasReady: false,
    saving: false,
    // 头像昵称设置弹窗
    showProfileModal: false
  },

  onLoad(options) {
    const type = options.type || 'INFP'
    const typeInfo = MBTI_TYPES[type]
    if (!typeInfo) {
      wx.navigateBack()
      return
    }

    const group = typeInfo.group
    const groupInfo = MBTI_GROUPS[group]
    const eightFunctions = this.buildFunctions(type)
    const userInfo = app.globalData.userInfo
    const hasUserInfo = app.globalData.hasUserInfo
    const isMyCard = app.globalData.myType === type

    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      headerHeight: app.globalData.headerHeight,
      type,
      typeInfo,
      groupInfo,
      eightFunctions,
      userInfo,
      hasUserInfo,
      isMyCard
    })
  },

  buildFunctions(type) {
    if (!type || !MBTI_TYPES[type]) return []
    return MBTI_TYPES[type].functions.map((code, index) => {
      const fn = COGNITIVE_FUNCTIONS[code]
      const pos = FUNCTION_POSITIONS[index]
      return {
        code,
        name: fn ? fn.name : code,
        fnColor: fn ? fn.color : '#64748b',
        posName: pos.name,
        posColor: pos.color,
        position: index + 1,
        strength: (8 - index) * 12.5,
        isShadow: index >= 4
      }
    })
  },

  changeTheme(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ currentTheme: key })
  },

  // Canvas 绘制名片（含用户头像昵称）
  async drawCard() {
    const { type, typeInfo, groupInfo, eightFunctions, currentTheme, themes, userInfo, hasUserInfo, isMyCard } = this.data
    const theme = themes.find(t => t.key === currentTheme)

    const query = wx.createSelectorQuery()
    query.select('#cardCanvas')
      .fields({ node: true, size: true })
      .exec(async (res) => {
        if (!res[0]) {
          wx.showToast({ title: '画布初始化失败', icon: 'none' })
          return
        }

        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = wx.getWindowInfo().pixelRatio
        const width = 750
        const height = 1200

        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)

        // 背景渐变
        const bgGrad = ctx.createLinearGradient(0, 0, width, height)
        bgGrad.addColorStop(0, theme.colors[0])
        bgGrad.addColorStop(0.5, theme.colors[1])
        bgGrad.addColorStop(1, theme.colors[2])
        ctx.fillStyle = bgGrad
        ctx.fillRect(0, 0, width, height)

        // 装饰圆
        ctx.globalAlpha = 0.1
        ctx.beginPath()
        ctx.arc(600, 150, 200, 0, Math.PI * 2)
        ctx.fillStyle = '#fff'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(100, 900, 150, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1

        // 顶部标识
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '24px -apple-system'
        ctx.textAlign = 'center'
        ctx.fillText('MBTI Match · 人格名片', width / 2, 50)

        let contentStartY = 70

        // 如果是自己的名片，始终绘制头像区域
        if (isMyCard) {
          try {
            const avatarSize = 100
            const avatarX = width / 2 - avatarSize / 2
            const avatarY = contentStartY + 10
            const centerX = width / 2
            const centerY = avatarY + avatarSize / 2

            // 圆形边框背景
            ctx.save()
            ctx.beginPath()
            ctx.arc(centerX, centerY, avatarSize / 2 + 4, 0, Math.PI * 2)
            ctx.fillStyle = 'rgba(255,255,255,0.3)'
            ctx.fill()
            ctx.restore()

            if (hasUserInfo && userInfo && userInfo.avatarUrl) {
              // 有头像：加载并绘制真实头像
              try {
                const avatarImg = await this.loadImage(canvas, userInfo.avatarUrl)
                ctx.save()
                ctx.beginPath()
                ctx.arc(centerX, centerY, avatarSize / 2, 0, Math.PI * 2)
                ctx.clip()
                ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize)
                ctx.restore()
              } catch (e) {
                // 头像加载失败，画默认圆
                this.drawDefaultAvatar(ctx, centerX, centerY, avatarSize / 2)
              }

              // 昵称
              ctx.fillStyle = '#ffffff'
              ctx.font = 'bold 30px -apple-system'
              ctx.textAlign = 'center'
              ctx.fillText(userInfo.nickname, centerX, avatarY + avatarSize + 40)
            } else {
              // 没有头像：画默认头像占位
              this.drawDefaultAvatar(ctx, centerX, centerY, avatarSize / 2)

              // 显示提示文字
              ctx.fillStyle = 'rgba(255,255,255,0.5)'
              ctx.font = '26px -apple-system'
              ctx.textAlign = 'center'
              ctx.fillText('点击设置头像昵称', centerX, avatarY + avatarSize + 40)
            }

            contentStartY = avatarY + avatarSize + 70
          } catch (e) {
            console.warn('绘制用户信息失败', e)
          }
        }

        // 类型码
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 96px -apple-system'
        ctx.textAlign = 'center'
        ctx.fillText(type, width / 2, contentStartY + 90)

        // 类型名称
        ctx.font = '36px -apple-system'
        ctx.fillStyle = 'rgba(255,255,255,0.8)'
        ctx.fillText(typeInfo.name + ' · ' + typeInfo.subtitle, width / 2, contentStartY + 150)

        // 族群标签
        ctx.fillStyle = groupInfo.color
        this.roundRect(ctx, width / 2 - 60, contentStartY + 175, 120, 40, 20)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 22px -apple-system'
        ctx.fillText(groupInfo.name, width / 2, contentStartY + 202)

        // 座右铭
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.font = 'italic 28px -apple-system'
        ctx.fillText(`"${typeInfo.motto}"`, width / 2, contentStartY + 270)

        // 标签
        const tags = typeInfo.tags
        const tagWidth = 100
        const tagGap = 16
        const totalWidth = tags.length * tagWidth + (tags.length - 1) * tagGap
        let tagX = (width - totalWidth) / 2
        tags.forEach(tag => {
          ctx.fillStyle = 'rgba(255,255,255,0.15)'
          this.roundRect(ctx, tagX, contentStartY + 300, tagWidth, 44, 22)
          ctx.fill()
          ctx.fillStyle = '#fff'
          ctx.font = '24px -apple-system'
          ctx.textAlign = 'center'
          ctx.fillText(tag, tagX + tagWidth / 2, contentStartY + 329)
          tagX += tagWidth + tagGap
        })

        // 分割线
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(60, contentStartY + 380)
        ctx.lineTo(width - 60, contentStartY + 380)
        ctx.stroke()

        // 八维认知功能标题
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '24px -apple-system'
        ctx.textAlign = 'center'
        ctx.fillText('八维认知功能', width / 2, contentStartY + 420)

        // 功能条
        const barStartY = contentStartY + 450
        const barHeight = 34
        const barGap = 12
        const barMaxWidth = 440
        const barStartX = 200

        eightFunctions.forEach((fn, i) => {
          const y = barStartY + i * (barHeight + barGap)
          const barWidth = barMaxWidth * (fn.strength / 100)

          // 序号和代码
          ctx.fillStyle = fn.isShadow ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)'
          ctx.font = 'bold 20px -apple-system'
          ctx.textAlign = 'right'
          ctx.fillText(`${fn.position}`, 80, y + 24)
          ctx.fillText(fn.code, 140, y + 24)

          // 功能名
          ctx.font = '18px -apple-system'
          ctx.textAlign = 'left'
          ctx.fillText(fn.name, 150, y + 24)

          // 条形图背景
          ctx.fillStyle = 'rgba(255,255,255,0.08)'
          this.roundRect(ctx, barStartX, y + 4, barMaxWidth, barHeight - 8, 8)
          ctx.fill()

          // 条形图
          ctx.fillStyle = fn.isShadow ? 'rgba(255,255,255,0.15)' : fn.fnColor
          ctx.globalAlpha = fn.isShadow ? 0.5 : 0.8
          this.roundRect(ctx, barStartX, y + 4, barWidth, barHeight - 8, 8)
          ctx.fill()
          ctx.globalAlpha = 1
        })

        // 底部专属语录
        const quoteY = barStartY + 8 * (barHeight + barGap) + 30
        ctx.fillStyle = 'rgba(255,255,255,0.4)'
        ctx.font = 'italic 22px -apple-system'
        ctx.textAlign = 'center'

        const quote = typeInfo.quote
        const maxLineWidth = width - 120
        const words = quote.split('')
        let line = ''
        const lines = []

        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i]
          const metrics = ctx.measureText(testLine)
          if (metrics.width > maxLineWidth && i > 0) {
            lines.push(line)
            line = words[i]
          } else {
            line = testLine
          }
        }
        lines.push(line)

        const startY = quoteY
        lines.forEach((l, i) => {
          ctx.fillText(l, width / 2, startY + i * 32)
        })

        // 底部水印
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.font = '20px -apple-system'
        ctx.fillText('长按保存 · 分享你的人格名片', width / 2, height - 30)

        this.canvas = canvas
        this.setData({ canvasReady: true })
      })
  },

  // 绘制默认头像（简洁的用户轮廓图标）
  drawDefaultAvatar(ctx, cx, cy, radius) {
    // 圆形背景
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.fill()

    // 头部（小圆）
    ctx.beginPath()
    ctx.arc(cx, cy - radius * 0.15, radius * 0.3, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fill()

    // 身体（半椭圆）
    ctx.beginPath()
    ctx.arc(cx, cy + radius * 0.65, radius * 0.45, Math.PI, 0)
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fill()
  },

  // 加载图片 Promise
  loadImage(canvas, src) {
    return new Promise((resolve, reject) => {
      const img = canvas.createImage()
      img.onload = () => resolve(img)
      img.onerror = (e) => reject(e)
      img.src = src
    })
  },

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
  },

  // 保存到相册
  async saveToAlbum() {
    if (!this.canvas) {
      await this.drawCard()
      setTimeout(() => this._doSave(), 500)
      return
    }
    this._doSave()
  },

  _doSave() {
    if (this.data.saving) return
    this.setData({ saving: true })

    wx.canvasToTempFilePath({
      canvas: this.canvas,
      width: this.canvas.width,
      height: this.canvas.height,
      destWidth: this.canvas.width,
      destHeight: this.canvas.height,
      fileType: 'png',
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            wx.showToast({ title: '已保存到相册', icon: 'success' })
          },
          fail: (err) => {
            if (err.errMsg.indexOf('auth deny') >= 0 || err.errMsg.indexOf('authorize') >= 0) {
              wx.showModal({
                title: '提示',
                content: '需要授权保存到相册的权限',
                success: (res) => {
                  if (res.confirm) {
                    wx.openSetting()
                  }
                }
              })
            } else {
              wx.showToast({ title: '保存失败', icon: 'none' })
            }
          },
          complete: () => {
            this.setData({ saving: false })
          }
        })
      },
      fail: () => {
        wx.showToast({ title: '生成图片失败', icon: 'none' })
        this.setData({ saving: false })
      }
    })
  },

  goBack() {
    wx.navigateBack()
  },

  goInvite() {
    wx.navigateTo({ url: `/pages/invite/invite?type=${this.data.type}` })
  },

  // ====== 头像昵称设置 ======
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

    // 重新绘制名片（更新头像）
    setTimeout(() => this.drawCard(), 300)

    wx.showToast({ title: '设置成功', icon: 'none' })
  },

  onShareAppMessage() {
    const { type, typeInfo, userInfo, isMyCard } = this.data
    const nickname = isMyCard && userInfo ? userInfo.nickname : ''
    
    return {
      title: `${nickname ? nickname + '是' : '我是'} ${type}（${typeInfo.name}）！来看看你是什么类型？`,
      path: '/pages/test/test?mode=single',
      withShareTicket: true
    }
  },

  onReady() {
    setTimeout(() => this.drawCard(), 300)
  }
})
