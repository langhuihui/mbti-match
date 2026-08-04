const userService = require('./utils/userService')
const cloudService = require('./utils/cloudService')
const analytics = require('./utils/analytics')

App({
  onLaunch() {
    cloudService.initCloud()
    analytics.track(analytics.EVENTS.APP_LAUNCH, {
      scene: wx.getLaunchOptionsSync().scene
    })
    // 获取系统信息
    const systemInfo = wx.getWindowInfo()
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect()

    this.globalData.systemInfo = systemInfo
    this.globalData.menuButtonInfo = menuButtonInfo
    this.globalData.statusBarHeight = systemInfo.statusBarHeight || 44
    this.globalData.navBarHeight = (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height
    this.globalData.headerHeight = systemInfo.statusBarHeight + this.globalData.navBarHeight

    // 通过数据服务加载用户/MBTI/好友/匹配记录/隐私
    userService.load().then((snapshot) => {
      this._syncSnapshot(snapshot)
      // 是否为新创建的默认用户：用于引导是否弹出"完善资料"
      this.globalData.needProfileSetup = !!(snapshot.userInfo && snapshot.userInfo.isDefault)
    })

    // 订阅 userService 的数据变化，保持 globalData 同步
    userService.subscribe('userInfo:change', (userInfo) => {
      this.globalData.userInfo = userInfo
      this.globalData.hasUserInfo = true
      this._notifyUserInfoListeners(userInfo)
    })
    userService.subscribe('mbti:change', (type) => {
      this.globalData.myType = type
    })
    userService.subscribe('friends:change', (friends) => {
      this.globalData.friends = friends
    })
    userService.subscribe('match:change', (history) => {
      this.globalData.matchHistory = history
    })
    userService.subscribe('privacy:change', (accepted) => {
      this.globalData.privacyAccepted = accepted
    })
  },

  // 将 userService 的 snapshot 写入 globalData（只读镜像）
  _syncSnapshot(s) {
    this.globalData.userInfo = s.userInfo
    this.globalData.hasUserInfo = s.hasUserInfo
    this.globalData.myType = s.myType
    this.globalData.friends = s.friends
    this.globalData.matchHistory = s.matchHistory
    this.globalData.privacyAccepted = s.privacyAccepted
  },

  // ========== 向后兼容的 API（委托给 userService） ==========

  // 保存用户信息（头像 + 昵称）
  saveUserInfo(userInfo) {
    return userService.saveUserInfo(userInfo)
  },

  // 保存我的 MBTI 类型
  saveMyMBTI(type) {
    return userService.saveMyMBTI(type)
  },

  // 添加好友
  addFriend(friendInfo) {
    return userService.addFriend(friendInfo)
  },

  // 添加匹配记录
  addMatchRecord(record) {
    return userService.addMatchRecord(record)
  },

  // 标记隐私协议已同意
  acceptPrivacy() {
    userService.acceptPrivacy()
    // 同步微信原生隐私授权（若基础库支持）
    if (wx.getPrivacySetting) {
      try {
        wx.getPrivacySetting({
          success: (res) => {
            if (res.needAuthorization && this._privacyResolve) {
              this._privacyResolve({ event: 'agree' })
              this._privacyResolve = null
            }
          }
        })
      } catch (e) {}
    }
  },

  onShow(options) {
    // 处理从分享链接进入的场景
    if (options && options.query) {
      this.handleShareEntry(options)
    }
    // 处理 shareTicket（从群聊打开时获取群信息）
    if (options && options.shareTicket) {
      this.globalData.shareTicket = options.shareTicket
      this.globalData.fromGroup = true
      this._resolveGroupInfo(options.shareTicket)
    }
  },

  // ====== 分享入口处理 ======

  handleShareEntry(options) {
    const { query, scene } = options
    if (scene === 1044 || scene === 1007 || scene === 1008) {
      this.globalData.fromGroup = (scene === 1044 || scene === 1008)
      if (options.shareTicket) {
        this.globalData.shareTicket = options.shareTicket
      }
    }
    if (query && query.code && query.type) {
      this.globalData.pendingInvite = {
        code: query.code,
        type: query.type,
        nickname: query.nickname ? decodeURIComponent(query.nickname) : '',
        avatarUrl: query.avatar ? decodeURIComponent(query.avatar) : '',
        timestamp: Date.now()
      }
    }
  },

  // 解析群信息（通过 shareTicket）
  _resolveGroupInfo(shareTicket) {
    wx.getShareInfo({
      shareTicket,
      success: (res) => {
        this.globalData.groupShareInfo = {
          encryptedData: res.encryptedData,
          iv: res.iv,
          timestamp: Date.now()
        }
      },
      fail: (err) => {
        console.warn('获取群聊信息失败', err)
      }
    })
  },

  // ====== 用户信息监听器（向后兼容） ======

  _userInfoListeners: [],

  onUserInfoChange(listener) {
    this._userInfoListeners.push(listener)
    if (this.globalData.hasUserInfo) {
      listener(this.globalData.userInfo)
    }
  },

  offUserInfoChange(listener) {
    const idx = this._userInfoListeners.indexOf(listener)
    if (idx >= 0) this._userInfoListeners.splice(idx, 1)
  },

  _notifyUserInfoListeners(userInfo) {
    this._userInfoListeners.forEach((fn) => {
      try { fn(userInfo) } catch (e) { console.warn(e) }
    })
  },

  // ====== 邀请码工具（与数据层无关，保留在 app） ======

  _b64Chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',

  _encodeBase64Url(str) {
    if (!str) return ''
    const bytes = []
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i)
      if (c < 0x80) {
        bytes.push(c)
      } else if (c < 0x800) {
        bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f))
      } else if (c < 0xd800 || c >= 0xe000) {
        bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f))
      } else {
        i++
        const c2 = 0x10000 + (((c & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff))
        bytes.push(0xf0 | (c2 >> 18), 0x80 | ((c2 >> 12) & 0x3f), 0x80 | ((c2 >> 6) & 0x3f), 0x80 | (c2 & 0x3f))
      }
    }
    const chars = this._b64Chars
    let out = ''
    for (let i = 0; i < bytes.length; i += 3) {
      const b1 = bytes[i]
      const b2 = i + 1 < bytes.length ? bytes[i + 1] : -1
      const b3 = i + 2 < bytes.length ? bytes[i + 2] : -1
      out += chars[b1 >> 2]
      out += chars[((b1 & 0x3) << 4) | ((b2 < 0 ? 0 : b2) >> 4)]
      if (b2 < 0) break
      out += chars[((b2 & 0xf) << 2) | ((b3 < 0 ? 0 : b3) >> 6)]
      if (b3 < 0) break
      out += chars[b3 & 0x3f]
    }
    return out
  },

  _decodeBase64Url(str) {
    if (!str) return ''
    const chars = this._b64Chars
    const lookup = {}
    for (let i = 0; i < chars.length; i++) lookup[chars[i]] = i
    const bytes = []
    let i = 0
    while (i < str.length) {
      const c1 = lookup[str[i++]]
      const c2 = lookup[str[i++]]
      const c3 = i < str.length ? lookup[str[i++]] : -1
      const c4 = i < str.length ? lookup[str[i++]] : -1
      if (c1 === undefined || c2 === undefined) return ''
      bytes.push((c1 << 2) | (c2 >> 4))
      if (c3 >= 0) bytes.push(((c2 & 0xf) << 4) | (c3 >> 2))
      if (c4 >= 0) bytes.push(((c3 & 0x3) << 6) | c4)
    }
    let out = ''
    let j = 0
    while (j < bytes.length) {
      const b = bytes[j++]
      if (b < 0x80) {
        out += String.fromCharCode(b)
      } else if (b < 0xe0) {
        out += String.fromCharCode(((b & 0x1f) << 6) | (bytes[j++] & 0x3f))
      } else if (b < 0xf0) {
        out += String.fromCharCode(((b & 0xf) << 12) | ((bytes[j++] & 0x3f) << 6) | (bytes[j++] & 0x3f))
      } else {
        const cp = ((b & 0x7) << 18) | ((bytes[j++] & 0x3f) << 12) | ((bytes[j++] & 0x3f) << 6) | (bytes[j++] & 0x3f)
        const off = cp - 0x10000
        out += String.fromCharCode(0xd800 + (off >> 10), 0xdc00 + (off & 0x3ff))
      }
    }
    return out
  },

  generateInviteCode(type) {
    const userInfo = this.globalData.userInfo || {}
    const ts = Date.now().toString(36)
    const random = Math.random().toString(36).slice(2, 6)
    const nickname = userInfo.nickname || ''
    const avatarUrl = userInfo.avatarUrl || ''
    let payload = ''
    if (nickname || avatarUrl) {
      payload = '_' + this._encodeBase64Url(nickname + '|' + avatarUrl)
    }
    return `${type}_${ts}_${random}${payload}`
  },

  parseInviteCode(code) {
    if (!code) return null
    const parts = code.split('_')
    if (parts.length < 2) return null
    const result = {
      type: parts[0],
      timestamp: parseInt(parts[1], 36) || 0,
      raw: code,
      nickname: '',
      avatarUrl: ''
    }
    if (parts.length >= 4) {
      try {
        const decoded = this._decodeBase64Url(parts[3])
        if (decoded && decoded.indexOf('|') >= 0) {
          const [nickname, avatarUrl] = decoded.split('|')
          result.nickname = nickname || ''
          result.avatarUrl = avatarUrl || ''
        }
      } catch (e) {
        // 第 4 段不是 payload，忽略
      }
    }
    return result
  },

  globalData: {
    systemInfo: null,
    menuButtonInfo: null,
    statusBarHeight: 44,
    navBarHeight: 44,
    headerHeight: 88,
    // 用户信息（镜像自 userService）
    userInfo: null,
    hasUserInfo: false,
    needProfileSetup: false,
    // MBTI
    myType: '',
    // 好友
    friends: [],
    // 匹配记录
    matchHistory: [],
    // 双人匹配
    inviteCode: '',
    inviteType: '',
    // 分享相关
    fromGroup: false,
    shareTicket: '',
    groupShareInfo: null,
    pendingInvite: null,
    // 隐私
    privacyAccepted: false,
    privacyVersion: '1.0.0'
  }
})
