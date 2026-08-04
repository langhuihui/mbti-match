const app = getApp()
const { MBTI_TYPES, MBTI_GROUPS, COGNITIVE_FUNCTIONS, FUNCTION_POSITIONS, RELATIONSHIP_TYPES } = require('../../utils/constants')
const { getMbtiRelation } = require('../../utils/mbtiRelations')
const analytics = require('../../utils/analytics')
const { buildResultBrief } = require('../../utils/relationSummary')
const {
  buildMicroRecordTemplate,
  publishMicroRecord,
  checkContentSafety,
  MICRO_MAX_LENGTH
} = require('../../utils/noteData')

Page({
  data: {
    statusBarHeight: 44,
    headerHeight: 88,
    // 邀请者信息
    inviterType: '',
    inviterInfo: null,
    inviterGroup: null,
    inviteCode: '',
    inviterNickname: '',
    inviterAvatar: '',
    // 我的信息
    userInfo: null,
    hasUserInfo: false,
    // 匹配流程
    step: 'select', // select / reveal
    // 我的选择
    selectMethod: 'grid',
    myType: '',
    myTypeInfo: null,
    personality: { E: false, N: false, F: false, J: false },
    typeGroups: [],
    switchItems: [
      { key: 'E', checked: 'E', unchecked: 'I', labelL: '内向 I', labelR: '外向 E' },
      { key: 'N', checked: 'N', unchecked: 'S', labelL: '感觉 S', labelR: '直觉 N' },
      { key: 'F', checked: 'F', unchecked: 'T', labelL: '思维 T', labelR: '情感 F' },
      { key: 'J', checked: 'J', unchecked: 'P', labelL: '知觉 P', labelR: '判断 J' }
    ],
    // 揭晓结果
    relation: null,
    showResult: false,
    revealAnimation: false,
    // 揭晓动画阶段：loading(悬念) -> revealing(翻转) -> shown(稳定)
    revealPhase: 'idle',
    // 星级亮起进度（0-5）
    starLit: 0,
    // ====== 双人对比海报 ======
    posterLoading: false,
    showPoster: false,
    posterUrl: '',
    // 匹配后微记录
    showMicroModal: false,
    microContent: '',
    microTemplate: '',
    microContext: null,
    microSubmitting: false,
    microMaxLength: MICRO_MAX_LENGTH
  },

  onLoad(options) {
    const inviterType = options.type || ''
    const inviteCode = options.code || ''
    const inviterNickname = options.nickname ? decodeURIComponent(options.nickname) : ''
    const inviterAvatar = options.avatar ? decodeURIComponent(options.avatar) : ''

    // 标记是否从分享进入（有邀请者类型说明来自分享链接）
    if (inviterType) {
      app.globalData.fromShare = true
    }

    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      headerHeight: app.globalData.headerHeight,
      userInfo: app.globalData.userInfo,
      hasUserInfo: app.globalData.hasUserInfo
    })

    if (inviterType && MBTI_TYPES[inviterType]) {
      const inviterInfo = MBTI_TYPES[inviterType]
      const inviterGroup = MBTI_GROUPS[inviterInfo.group]
      this.setData({
        inviterType,
        inviterInfo,
        inviterGroup,
        inviteCode,
        inviterNickname,
        inviterAvatar
      })
      analytics.track(analytics.EVENTS.INVITE_OPENED, {
        inviterType,
        hasNickname: !!inviterNickname,
        fromShare: true
      })
    }

    analytics.trackPageView('match', { hasInviter: !!inviterType })
    this.buildTypeGroups()
    this.updateMyType()
  },

  buildTypeGroups() {
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
          image: MBTI_TYPES[code].image
        }))
      }
    })
    this.setData({ typeGroups: groups })
  },

  getType(personality) {
    return (personality.E ? 'E' : 'I') +
      (personality.N ? 'N' : 'S') +
      (personality.F ? 'F' : 'T') +
      (personality.J ? 'J' : 'P')
  },

  updateMyType() {
    const type = this.getType(this.data.personality)
    this.setData({
      myType: type,
      myTypeInfo: MBTI_TYPES[type]
    })
  },

  switchMethod(e) {
    const { method } = e.currentTarget.dataset
    this.setData({ selectMethod: method })
  },

  onSwitchChange(e) {
    const { key } = e.currentTarget.dataset
    const personality = { ...this.data.personality }
    personality[key] = !personality[key]
    this.setData({ personality })
    this.updateMyType()
  },

  onGridSelect(e) {
    const { code } = e.currentTarget.dataset
    const personality = {
      E: code[0] === 'E',
      N: code[1] === 'N',
      F: code[2] === 'F',
      J: code[3] === 'J'
    }
    this.setData({ personality })
    this.updateMyType()
  },

  // 揭晓关系
  revealRelation() {
    const { inviterType, myType, inviterNickname, inviterAvatar } = this.data
    if (!inviterType || !myType) return

    const relationKey = getMbtiRelation(myType, inviterType)
    const relation = RELATIONSHIP_TYPES[relationKey] || {
      emoji: '?', name: relationKey, subtitle: '', desc: '', detail: '', color: '#64748b', level: 3
    }

    // 生成星级
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push({ filled: i < relation.level })
    }

    const brief = buildResultBrief(myType, inviterType, relationKey, relation)

    this.setData({
      step: 'reveal',
      relation: { ...relation, stars },
      brief,
      revealAnimation: true,
      revealPhase: 'loading',
      showResult: false,
      starLit: 0
    })

    // 轻微震动增强仪式感
    try { wx.vibrateShort({ type: 'light' }) } catch (e) {}

    // 悬念 1000ms 后进入翻转
    setTimeout(() => {
      this.setData({ revealPhase: 'revealing', showResult: true })
      try { wx.vibrateShort({ type: 'medium' }) } catch (e) {}
      // 翻转动画 600ms 后稳定
      setTimeout(() => {
        this.setData({ revealPhase: 'shown' })
        this._lightStars(relation.level || 0, () => {
          this._openMicroRecordPrompt(relationKey, relation)
        })
      }, 600)
    }, 1000)

    // 保存匹配记录
    app.addMatchRecord({
      myType,
      friendType: inviterType,
      friendNickname: inviterNickname || inviterType,
      friendAvatar: inviterAvatar || '',
      relation: relation.name || relationKey
    })

    // 保存好友信息
    if (inviterNickname || inviterAvatar) {
      app.addFriend({
        id: this.data.inviteCode || `${inviterType}_${Date.now()}`,
        nickname: inviterNickname,
        avatarUrl: inviterAvatar,
        mbtiType: inviterType,
        matchDate: new Date().toISOString()
      })
    }

    // 保存我的MBTI
    app.saveMyMBTI(myType)

    analytics.track(analytics.EVENTS.MATCH_COMPLETED, {
      myType,
      inviterType,
      relation: relation.name || relationKey,
      inviteCode: this.data.inviteCode || ''
    })
  },

  goQuickTest() {
    wx.navigateTo({ url: '/pages/quick-test/quick-test?from=match' })
  },

  // 星级依次点亮
  _lightStars(total, onDone) {
    let i = 0
    const tick = () => {
      i++
      this.setData({ starLit: i })
      try { wx.vibrateShort({ type: 'light' }) } catch (e) {}
      if (i < total) {
        setTimeout(tick, 180)
      } else if (typeof onDone === 'function') {
        setTimeout(onDone, 400)
      }
    }
    if (total > 0) {
      setTimeout(tick, 120)
    } else if (typeof onDone === 'function') {
      setTimeout(onDone, 400)
    }
  },

  _openMicroRecordPrompt(relationKey, relation) {
    const { myType, inviterType, inviterNickname } = this.data
    const matchContext = {
      myType,
      friendType: inviterType,
      friendNickname: inviterNickname || inviterType,
      relationName: (relation && relation.name) || relationKey,
      relationEmoji: (relation && relation.emoji) || ''
    }
    const template = buildMicroRecordTemplate(matchContext)
    this.setData({
      showMicroModal: true,
      microTemplate: template,
      microContent: template,
      microContext: matchContext
    })
  },

  onMicroInput(e) {
    this.setData({ microContent: e.detail.value })
  },

  closeMicroModal() {
    analytics.track(analytics.EVENTS.MICRO_RECORD_SKIPPED, {
      myType: this.data.myType,
      friendType: this.data.inviterType
    })
    this.setData({ showMicroModal: false, microContent: '', microContext: null })
  },

  async submitMicroRecord() {
    const { microContent, microContext, microSubmitting, microTemplate } = this.data
    if (microSubmitting) return

    const text = (microContent || '').trim()
    if (!text || text === microTemplate.trim()) {
      wx.showToast({ title: '补全你的感受吧', icon: 'none' })
      return
    }

    this.setData({ microSubmitting: true })
    const safety = await checkContentSafety(text)
    if (!safety.safe) {
      wx.showToast({ title: safety.reason || '内容未通过审核', icon: 'none' })
      this.setData({ microSubmitting: false })
      return
    }

    const userInfo = app.globalData.userInfo || {}
    const author = {
      nickname: userInfo.nickname || '匿名用户',
      avatarUrl: userInfo.avatarUrl || '',
      mbtiType: app.globalData.myType || microContext.myType,
      mbtiGroup: ''
    }

    const note = publishMicroRecord({
      author,
      content: text,
      matchContext: microContext
    })

    this.setData({ microSubmitting: false, showMicroModal: false })

    if (note) {
      analytics.track(analytics.EVENTS.MICRO_RECORD_PUBLISHED, {
        myType: microContext.myType,
        friendType: microContext.friendType,
        relation: microContext.relationName
      })
      wx.showToast({ title: '已记录到发现页', icon: 'success' })
    } else {
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  viewDetail() {
    const { inviterType, myType } = this.data
    wx.navigateTo({
      url: `/pages/result/result?type1=${myType}&type2=${inviterType}`
    })
  },

  // 我也要生成名片
  goMyCard() {
    wx.navigateTo({
      url: `/pages/card/card?type=${this.data.myType}`
    })
  },

  // 邀请TA也来测
  goInviteBack() {
    const { myType } = this.data
    app.saveMyMBTI(myType)
    wx.navigateTo({
      url: `/pages/invite/invite?type=${myType}`
    })
  },

  goBack() {
    if (this.data.step === 'reveal') {
      this.setData({
        step: 'select',
        showResult: false,
        revealAnimation: false,
        revealPhase: 'idle',
        starLit: 0
      })
    } else {
      wx.navigateBack()
    }
  },

  goHome() {
    wx.reLaunch({ url: '/pages/index/index' })
  },

  // ====== 双人对比海报 ======
  generatePoster() {
    if (this.data.posterLoading) return
    this.setData({ posterLoading: true })
    this._drawPoster()
      .then((tempPath) => {
        this.setData({
          posterLoading: false,
          posterUrl: tempPath,
          showPoster: true
        })
      })
      .catch((err) => {
        console.warn('海报生成失败', err)
        this.setData({ posterLoading: false })
        wx.showToast({ title: '生成失败，稍后重试', icon: 'none' })
      })
  },

  closePoster() {
    this.setData({ showPoster: false })
  },

  savePoster() {
    const { posterUrl } = this.data
    if (!posterUrl) return
    wx.saveImageToPhotosAlbum({
      filePath: posterUrl,
      success: () => {
        wx.showToast({ title: '已保存到相册', icon: 'success' })
      },
      fail: (err) => {
        if (err.errMsg && (err.errMsg.indexOf('auth deny') >= 0 || err.errMsg.indexOf('authorize') >= 0)) {
          wx.showModal({
            title: '需要授权',
            content: '请授权保存到相册',
            success: (r) => { if (r.confirm) wx.openSetting() }
          })
        } else {
          wx.showToast({ title: '保存失败', icon: 'none' })
        }
      }
    })
  },

  _loadImage(canvas, src) {
    return new Promise((resolve, reject) => {
      if (!src) return reject(new Error('empty src'))
      const img = canvas.createImage()
      img.onload = () => resolve(img)
      img.onerror = (e) => reject(e)
      img.src = src
    })
  },

  _roundRect(ctx, x, y, w, h, r) {
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

  _drawAvatarOnCanvas(ctx, canvas, src, cx, cy, r, fallbackFn) {
    return this._loadImage(canvas, src)
      .then((img) => {
        ctx.save()
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2)
        ctx.restore()
      })
      .catch(() => {
        if (fallbackFn) fallbackFn(ctx, cx, cy, r)
      })
  },

  _drawFallbackAvatar(ctx, cx, cy, r, color) {
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fillStyle = color || 'rgba(255,255,255,0.18)'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx, cy - r * 0.18, r * 0.32, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx, cy + r * 0.55, r * 0.45, Math.PI, 0)
    ctx.fill()
  },

  // 文本换行绘制
  _wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    if (!text) return y
    const chars = text.split('')
    let line = ''
    let drawnLines = 0
    let cursorY = y
    for (let i = 0; i < chars.length; i++) {
      const test = line + chars[i]
      const width = ctx.measureText(test).width
      if (width > maxWidth && line.length > 0) {
        if (maxLines && drawnLines === maxLines - 1) {
          // 最后一行加省略号
          let tail = line
          while (ctx.measureText(tail + '…').width > maxWidth && tail.length > 0) {
            tail = tail.slice(0, -1)
          }
          ctx.fillText(tail + '…', x, cursorY)
          return cursorY + lineHeight
        }
        ctx.fillText(line, x, cursorY)
        cursorY += lineHeight
        line = chars[i]
        drawnLines++
      } else {
        line = test
      }
    }
    if (line) {
      ctx.fillText(line, x, cursorY)
      cursorY += lineHeight
    }
    return cursorY
  },

  async _drawPoster() {
    const {
      myType, myTypeInfo, userInfo, hasUserInfo,
      inviterType, inviterInfo, inviterNickname, inviterAvatar,
      relation
    } = this.data

    if (!relation) throw new Error('relation missing')

    // 拿到 node
    const canvasInfo = await new Promise((resolve, reject) => {
      wx.createSelectorQuery()
        .select('#posterCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res || !res[0] || !res[0].node) return reject(new Error('canvas not found'))
          resolve(res[0])
        })
    })

    const canvas = canvasInfo.node
    const ctx = canvas.getContext('2d')
    const dpr = (wx.getWindowInfo && wx.getWindowInfo().pixelRatio) || 2
    const W = 720
    const H = 1080
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    // ---- 背景（基于关系颜色的双色渐变） ----
    const baseColor = relation.color || '#8b5cf6'
    const bgGrad = ctx.createLinearGradient(0, 0, W, H)
    bgGrad.addColorStop(0, '#1e1b4b')
    bgGrad.addColorStop(0.55, '#312e81')
    bgGrad.addColorStop(1, baseColor)
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, W, H)

    // 装饰光斑
    ctx.globalAlpha = 0.15
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(W - 80, 120, 160, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(60, H - 200, 180, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1

    // ---- 顶部品牌 ----
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = '22px -apple-system, system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('MBTI Match · 关系对比', W / 2, 50)

    // ---- 双人头像卡 ----
    const avatarR = 76
    const leftCX = W * 0.25
    const rightCX = W * 0.75
    const avatarCY = 190

    // 左：我
    // 头像背景圆
    ctx.beginPath()
    ctx.arc(leftCX, avatarCY, avatarR + 6, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.28)'
    ctx.fill()

    const mySrc = hasUserInfo && userInfo ? userInfo.avatarUrl : (myTypeInfo && myTypeInfo.image)
    await this._drawAvatarOnCanvas(ctx, canvas, mySrc, leftCX, avatarCY, avatarR,
      (c, x, y, r) => this._drawFallbackAvatar(c, x, y, r))

    // 右：TA
    ctx.beginPath()
    ctx.arc(rightCX, avatarCY, avatarR + 6, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.28)'
    ctx.fill()

    const taSrc = inviterAvatar || (inviterInfo && inviterInfo.image)
    await this._drawAvatarOnCanvas(ctx, canvas, taSrc, rightCX, avatarCY, avatarR,
      (c, x, y, r) => this._drawFallbackAvatar(c, x, y, r))

    // 昵称
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 26px -apple-system, system-ui'
    ctx.textAlign = 'center'
    const myName = hasUserInfo && userInfo ? (userInfo.nickname || '我') : '我'
    const taName = inviterNickname || 'TA'
    ctx.fillText(myName.length > 8 ? myName.slice(0, 7) + '…' : myName, leftCX, avatarCY + avatarR + 40)
    ctx.fillText(taName.length > 8 ? taName.slice(0, 7) + '…' : taName, rightCX, avatarCY + avatarR + 40)

    // MBTI 类型
    ctx.font = 'bold 38px -apple-system, system-ui'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(myType, leftCX, avatarCY + avatarR + 88)
    ctx.fillText(inviterType, rightCX, avatarCY + avatarR + 88)

    // 类型名
    ctx.font = '22px -apple-system, system-ui'
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    if (myTypeInfo) ctx.fillText(myTypeInfo.name, leftCX, avatarCY + avatarR + 120)
    if (inviterInfo) ctx.fillText(inviterInfo.name, rightCX, avatarCY + avatarR + 120)

    // 中间"×"装饰
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = 'bold 44px -apple-system, system-ui'
    ctx.fillText('×', W / 2, avatarCY + 14)

    // ---- 中部关系徽章 ----
    const badgeY = 500
    // 徽章阴影底
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.3)'
    ctx.shadowBlur = 30
    ctx.shadowOffsetY = 10
    ctx.fillStyle = baseColor
    this._roundRect(ctx, W / 2 - 200, badgeY - 50, 400, 100, 50)
    ctx.fill()
    ctx.restore()

    // 徽章内容
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 34px -apple-system, system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const emoji = relation.emoji || '★'
    ctx.fillText(`${emoji}  ${relation.name || '关系'}`, W / 2, badgeY)
    ctx.textBaseline = 'alphabetic'

    // 副标题
    if (relation.subtitle) {
      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.font = '24px -apple-system, system-ui'
      ctx.fillText(relation.subtitle, W / 2, badgeY + 82)
    }

    // ---- 星级 ----
    const starY = badgeY + 122
    const starGap = 44
    const starTotal = 5
    const starLvl = relation.level || 0
    const starStartX = W / 2 - (starTotal - 1) * starGap / 2
    ctx.font = '32px -apple-system, system-ui'
    ctx.textAlign = 'center'
    for (let i = 0; i < starTotal; i++) {
      ctx.fillStyle = i < starLvl ? '#fbbf24' : 'rgba(255,255,255,0.25)'
      ctx.fillText('★', starStartX + i * starGap, starY)
    }

    // ---- 分割线 ----
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(80, starY + 40)
    ctx.lineTo(W - 80, starY + 40)
    ctx.stroke()

    // ---- 描述与详解 ----
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 28px -apple-system, system-ui'
    ctx.textAlign = 'left'
    let cursorY = starY + 90
    if (relation.desc) {
      cursorY = this._wrapText(ctx, relation.desc, 60, cursorY, W - 120, 42, 2)
      cursorY += 10
    }

    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.font = '24px -apple-system, system-ui'
    if (relation.detail) {
      cursorY = this._wrapText(ctx, relation.detail, 60, cursorY, W - 120, 38, 4)
    }

    // ---- 底部水印 ----
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.font = '22px -apple-system, system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('扫码一起测 · MBTI Match', W / 2, H - 50)

    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '18px -apple-system, system-ui'
    ctx.fillText('基于荣格认知功能理论 · 仅供娱乐参考', W / 2, H - 22)

    // ---- 导出 ----
    return new Promise((resolve, reject) => {
      wx.canvasToTempFilePath({
        canvas,
        width: canvas.width,
        height: canvas.height,
        destWidth: W * 2,
        destHeight: H * 2,
        fileType: 'jpg',
        quality: 0.92,
        success: (res) => resolve(res.tempFilePath),
        fail: reject
      })
    })
  },

  onShareAppMessage() {
    const { myType, myTypeInfo, userInfo, hasUserInfo } = this.data
    const nickname = hasUserInfo ? userInfo.nickname : ''
    const avatarUrl = hasUserInfo ? userInfo.avatarUrl : ''
    const inviteCode = app.generateInviteCode(myType)
    
    let sharePath = `/pages/match/match?code=${inviteCode}&type=${myType}`
    if (nickname) {
      sharePath += `&nickname=${encodeURIComponent(nickname)}`
    }
    if (avatarUrl) {
      sharePath += `&avatar=${encodeURIComponent(avatarUrl)}`
    }
    
    return {
      title: `${nickname ? nickname + '是' : '我是'} ${myType}（${myTypeInfo ? myTypeInfo.name : ''}），来测测我们是什么关系？`,
      path: sharePath,
      imageUrl: this.data.posterUrl || undefined,
      withShareTicket: true
    }
  }
})
