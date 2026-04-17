App({
  onLaunch() {
    // 获取系统信息
    const systemInfo = wx.getWindowInfo()
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect()
    
    this.globalData.systemInfo = systemInfo
    this.globalData.menuButtonInfo = menuButtonInfo
    this.globalData.statusBarHeight = systemInfo.statusBarHeight || 44
    this.globalData.navBarHeight = (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height
    this.globalData.headerHeight = systemInfo.statusBarHeight + this.globalData.navBarHeight

    // 加载用户数据
    this.loadUserData()
    
    // 检测是否首次进入
    if (!this.globalData.hasUserInfo) {
      this.globalData.needProfileSetup = true
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

  // ====== 用户系统 ======
  
  // 加载本地缓存的用户数据
  loadUserData() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        this.globalData.userInfo = userInfo
        this.globalData.hasUserInfo = true
      }
      
      const myMBTI = wx.getStorageSync('myMBTI')
      if (myMBTI) {
        this.globalData.myType = myMBTI
      }

      // 加载好友列表
      const friends = wx.getStorageSync('friends')
      if (friends) {
        this.globalData.friends = friends
      }

      // 加载匹配记录
      const matchHistory = wx.getStorageSync('matchHistory')
      if (matchHistory) {
        this.globalData.matchHistory = matchHistory
      }
    } catch (e) {
      console.warn('读取本地缓存失败', e)
    }
  },

  // 保存用户信息（头像 + 昵称）
  saveUserInfo(userInfo) {
    this.globalData.userInfo = userInfo
    this.globalData.hasUserInfo = true
    try {
      wx.setStorageSync('userInfo', userInfo)
    } catch (e) {
      console.warn('保存用户信息失败', e)
    }
    // 通知所有监听者
    this._notifyUserInfoListeners(userInfo)
  },

  // 保存我的 MBTI 类型
  saveMyMBTI(type) {
    this.globalData.myType = type
    try {
      wx.setStorageSync('myMBTI', type)
    } catch (e) {
      console.warn('保存 MBTI 类型失败', e)
    }
  },

  // ====== 好友系统（基于本地存储） ======
  
  // 添加好友记录（通过分享链接匹配到的好友）
  addFriend(friendInfo) {
    // friendInfo: { id, nickname, avatarUrl, mbtiType, matchDate }
    const friends = this.globalData.friends || []
    
    // 检查是否已存在
    const existingIndex = friends.findIndex(f => f.id === friendInfo.id)
    if (existingIndex >= 0) {
      friends[existingIndex] = { ...friends[existingIndex], ...friendInfo }
    } else {
      friends.unshift(friendInfo)
    }
    
    // 最多保存 100 位好友
    if (friends.length > 100) friends.length = 100
    
    this.globalData.friends = friends
    try {
      wx.setStorageSync('friends', friends)
    } catch (e) {
      console.warn('保存好友列表失败', e)
    }
  },

  // 添加匹配记录
  addMatchRecord(record) {
    // record: { myType, friendType, friendNickname, friendAvatar, relation, date }
    const history = this.globalData.matchHistory || []
    history.unshift({
      ...record,
      date: record.date || new Date().toISOString()
    })
    
    // 最多保存 50 条记录
    if (history.length > 50) history.length = 50
    
    this.globalData.matchHistory = history
    try {
      wx.setStorageSync('matchHistory', history)
    } catch (e) {
      console.warn('保存匹配记录失败', e)
    }
  },

  // ====== 分享入口处理 ======
  
  handleShareEntry(options) {
    const { query, scene } = options
    // 从群聊打开（场景值：1044=带shareTicket的群聊, 1007=单人聊天, 1008=群聊）
    if (scene === 1044 || scene === 1007 || scene === 1008) {
      this.globalData.fromGroup = (scene === 1044 || scene === 1008)
      if (options.shareTicket) {
        this.globalData.shareTicket = options.shareTicket
      }
    }
  },

  // 解析群信息（通过 shareTicket）
  _resolveGroupInfo(shareTicket) {
    wx.getShareInfo({
      shareTicket,
      success: (res) => {
        // res 包含 encryptedData 和 iv
        // 实际项目中需要后端解密获取 openGId
        // 这里存储原始信息供后续使用
        this.globalData.groupShareInfo = {
          encryptedData: res.encryptedData,
          iv: res.iv,
          timestamp: Date.now()
        }
        console.log('获取群聊信息成功')
      },
      fail: (err) => {
        console.warn('获取群聊信息失败', err)
      }
    })
  },

  // ====== 用户信息监听器 ======
  
  _userInfoListeners: [],

  onUserInfoChange(listener) {
    this._userInfoListeners.push(listener)
    // 如果已有用户信息，立即通知
    if (this.globalData.hasUserInfo) {
      listener(this.globalData.userInfo)
    }
  },

  offUserInfoChange(listener) {
    const idx = this._userInfoListeners.indexOf(listener)
    if (idx >= 0) this._userInfoListeners.splice(idx, 1)
  },

  _notifyUserInfoListeners(userInfo) {
    this._userInfoListeners.forEach(fn => {
      try { fn(userInfo) } catch (e) { console.warn(e) }
    })
  },

  // ====== 工具方法 ======
  
  // 生成唯一邀请码（包含用户信息）
  generateInviteCode(type) {
    const userInfo = this.globalData.userInfo || {}
    const ts = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 4)
    return `${type}_${ts}_${random}`
  },

  // 解析邀请码
  parseInviteCode(code) {
    if (!code) return null
    const parts = code.split('_')
    if (parts.length < 2) return null
    return {
      type: parts[0],
      timestamp: parseInt(parts[1], 36),
      raw: code
    }
  },

  globalData: {
    systemInfo: null,
    menuButtonInfo: null,
    statusBarHeight: 44,
    navBarHeight: 44,
    headerHeight: 88,
    // 用户信息
    userInfo: null,
    hasUserInfo: false,
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
    groupShareInfo: null
  }
})
