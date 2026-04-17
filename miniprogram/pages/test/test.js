const app = getApp()
const { MBTI_TYPES, COGNITIVE_FUNCTIONS, FUNCTION_POSITIONS, MBTI_TYPE_ORDER, MBTI_GROUPS } = require('../../utils/constants')

Page({
  data: {
    statusBarHeight: 44,
    headerHeight: 88,
    mode: 'single', // single / dual / quick
    step: 'select', // select / confirm
    currentPlayer: 1, // 1 or 2 (dual mode)
    // 类型选择
    personality1: { E: false, N: false, F: false, J: false },
    personality2: { E: false, N: false, F: false, J: false },
    type1: 'ISTP',
    type2: 'ISTP',
    type1Info: null,
    type2Info: null,
    // 选择方式
    selectMethod: 'switch', // switch / grid
    // 网格选择
    typeGroups: [],
    // 开关配置
    switchItems: [
      { key: 'E', checked: 'E', unchecked: 'I', labelL: '内向 I', labelR: '外向 E' },
      { key: 'N', checked: 'N', unchecked: 'S', labelL: '感觉 S', labelR: '直觉 N' },
      { key: 'F', checked: 'F', unchecked: 'T', labelL: '思维 T', labelR: '情感 F' },
      { key: 'J', checked: 'J', unchecked: 'P', labelL: '知觉 P', labelR: '判断 J' }
    ],
    // 八维功能展示
    eightFunctions: [],
    functionPositions: FUNCTION_POSITIONS
  },

  onLoad(options) {
    const mode = options.mode || 'single'
    this.setData({
      mode,
      statusBarHeight: app.globalData.statusBarHeight,
      headerHeight: app.globalData.headerHeight
    })
    this.buildTypeGroups()
    this.updateCurrentType()
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

  // 获取当前人格类型
  getType(personality) {
    return (personality.E ? 'E' : 'I') +
      (personality.N ? 'N' : 'S') +
      (personality.F ? 'F' : 'T') +
      (personality.J ? 'J' : 'P')
  },

  getTypeColor(type) {
    if (!type || !MBTI_TYPES[type]) return '#6366f1'
    const group = MBTI_TYPES[type].group
    return MBTI_GROUPS[group] ? MBTI_GROUPS[group].color : '#6366f1'
  },

  updateCurrentType() {
    if (this.data.currentPlayer === 1 || this.data.mode === 'single') {
      const type = this.getType(this.data.personality1)
      const info = MBTI_TYPES[type]
      const functions = this.buildFunctions(type)
      this.setData({
        type1: type,
        type1Info: info,
        eightFunctions: functions
      })
    } else {
      const type = this.getType(this.data.personality2)
      const info = MBTI_TYPES[type]
      const functions = this.buildFunctions(type)
      this.setData({
        type2: type,
        type2Info: info,
        eightFunctions: functions
      })
    }
  },

  buildFunctions(type) {
    if (!type || !MBTI_TYPES[type]) return []
    return MBTI_TYPES[type].functions.map((code, index) => {
      const fn = COGNITIVE_FUNCTIONS[code]
      const pos = FUNCTION_POSITIONS[index]
      return {
        code,
        name: fn ? fn.name : code,
        description: fn ? fn.description : '',
        fnColor: fn ? fn.color : '#64748b',
        posName: pos.name,
        posDesc: pos.desc,
        posColor: pos.color,
        position: index + 1,
        isShadow: index >= 4
      }
    })
  },

  // 切换选择方式
  switchMethod(e) {
    const { method } = e.currentTarget.dataset
    this.setData({ selectMethod: method })
  },

  // 开关变更
  onSwitchChange(e) {
    const { key } = e.currentTarget.dataset
    const player = this.data.currentPlayer
    const field = player === 1 ? 'personality1' : 'personality2'
    const personality = { ...this.data[field] }
    personality[key] = !personality[key]
    this.setData({ [field]: personality })
    this.updateCurrentType()
  },

  // 网格选择类型
  onGridSelect(e) {
    const { code } = e.currentTarget.dataset
    // 将类型code转为personality对象
    const personality = {
      E: code[0] === 'E',
      N: code[1] === 'N',
      F: code[2] === 'F',
      J: code[3] === 'J'
    }
    const player = this.data.currentPlayer
    if (this.data.mode === 'quick') {
      if (player === 1) {
        this.setData({
          personality1: personality,
          type1: code,
          type1Info: MBTI_TYPES[code]
        })
      } else {
        this.setData({
          personality2: personality,
          type2: code,
          type2Info: MBTI_TYPES[code]
        })
      }
      this.updateCurrentType()
    } else {
      const field = player === 1 ? 'personality1' : 'personality2'
      this.setData({ [field]: personality })
      this.updateCurrentType()
    }
  },

  // 确认当前选择
  onConfirm() {
    const { mode, currentPlayer, type1, type2 } = this.data

    if (mode === 'single') {
      // 单人模式：保存 MBTI 并生成名片
      app.saveMyMBTI(type1)
      wx.navigateTo({ url: `/pages/card/card?type=${type1}` })
    } else if (mode === 'dual') {
      if (currentPlayer === 1) {
        // 第一个人选完，保存并切换到第二个人
        app.saveMyMBTI(type1)
        this.setData({
          currentPlayer: 2,
          eightFunctions: this.buildFunctions(this.getType(this.data.personality2))
        })
      } else {
        // 两个人都选完了，查看结果
        const t1 = this.data.type1
        const t2 = this.getType(this.data.personality2)
        this.setData({ type2: t2, type2Info: MBTI_TYPES[t2] })
        wx.navigateTo({ url: `/pages/result/result?type1=${t1}&type2=${t2}` })
      }
    }
  },

  // 返回选第一个人
  goBackPlayer1() {
    this.setData({
      currentPlayer: 1,
      eightFunctions: this.buildFunctions(this.data.type1)
    })
  },

  goBack() {
    wx.navigateBack()
  },

  onShareAppMessage() {
    return {
      title: '来测测你的MBTI人格类型吧！',
      path: '/pages/test/test?mode=single'
    }
  }
})
