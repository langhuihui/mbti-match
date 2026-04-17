const DEFAULT_AVATAR = '/images/default-avatar.svg'

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
    // 选择头像回调（微信官方组件）
    onChooseAvatar(e) {
      const { avatarUrl } = e.detail
      this.setData({ tempAvatarUrl: avatarUrl })
    },

    // 昵称输入
    onNicknameInput(e) {
      this.setData({ tempNickname: e.detail.value })
    },

    // 确认
    onConfirm() {
      const { tempAvatarUrl, tempNickname } = this.data
      
      if (!tempNickname.trim()) {
        wx.showToast({ title: '请输入昵称', icon: 'none' })
        return
      }

      const userInfo = {
        avatarUrl: tempAvatarUrl || DEFAULT_AVATAR,
        nickname: tempNickname.trim(),
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
