const { AVATAR_LIST, NICKNAME_PREFIXES, NICKNAME_SUFFIXES } = require('../../utils/userService')

Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    initialAvatar: {
      type: String,
      value: ''
    },
    initialNickname: {
      type: String,
      value: ''
    }
  },

  data: {
    tempAvatarUrl: '',
    tempNickname: ''
  },

  observers: {
    'show, initialAvatar, initialNickname': function(show, initialAvatar, initialNickname) {
      if (show) {
        this.setData({
          tempAvatarUrl: initialAvatar || '',
          tempNickname: initialNickname || ''
        })
      }
    }
  },

  methods: {
    // 选择微信头像
    onChooseAvatar(e) {
      const { avatarUrl } = e.detail
      if (avatarUrl) {
        this.setData({ tempAvatarUrl: avatarUrl })
      }
    },

    // 随机换一个人格头像
    onRandomAvatar() {
      const list = AVATAR_LIST
      // 避免和当前一样
      let avatar
      do {
        avatar = list[Math.floor(Math.random() * list.length)]
      } while (avatar === this.data.tempAvatarUrl && list.length > 1)
      this.setData({ tempAvatarUrl: avatar })
    },

    // 手动输入昵称
    onNicknameInput(e) {
      this.setData({ tempNickname: e.detail.value })
    },

    // 微信昵称输入（通过隐藏的 type="nickname" input 获取）
    onWxNicknameInput(e) {
      const val = e.detail.value
      if (val) {
        this.setData({ tempNickname: val })
      }
    },

    onWxNicknameBlur(e) {
      const val = e.detail.value
      if (val) {
        this.setData({ tempNickname: val })
      }
    },

    // 随机生成昵称
    onRandomNickname() {
      const prefixes = NICKNAME_PREFIXES
      const suffixes = NICKNAME_SUFFIXES
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
      const nickname = prefix + suffix
      this.setData({ tempNickname: nickname })
    },

    // 空操作（chooseAvatar button 用于包裹 nickname input）
    _noop() {},

    // 确认
    onConfirm() {
      const { tempAvatarUrl, tempNickname } = this.data
      
      if (!tempNickname.trim()) {
        wx.showToast({ title: '请输入昵称', icon: 'none' })
        return
      }

      const userInfo = {
        avatarUrl: tempAvatarUrl || '/images/default-avatar.svg',
        nickname: tempNickname.trim(),
        isDefault: false, // 用户主动修改过
        updateTime: new Date().toISOString()
      }

      this.triggerEvent('confirm', userInfo)
    },

    // 取消
    onCancel() {
      this.triggerEvent('cancel')
    }
  }
})
