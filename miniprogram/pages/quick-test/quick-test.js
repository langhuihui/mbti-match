const app = getApp()
const { MBTI_TYPES, MBTI_GROUPS } = require('../../utils/constants')
const { QUESTIONS, TOTAL, calculateResult } = require('../../utils/quickTest')
const analytics = require('../../utils/analytics')

Page({
  data: {
    statusBarHeight: 44,
    headerHeight: 88,
    from: '',
    step: 'quiz', // quiz | result
    currentIndex: 0,
    questions: QUESTIONS,
    total: TOTAL,
    answers: {},
    selectedKey: '',
    progress: 0,
    resultType: '',
    resultInfo: null,
    resultGroup: null,
    confidence: 0
  },

  onLoad(options) {
    const from = options.from || 'index'
    this.setData({
      from,
      statusBarHeight: app.globalData.statusBarHeight,
      headerHeight: app.globalData.headerHeight,
      progress: Math.round((1 / TOTAL) * 100)
    })
    analytics.track(analytics.EVENTS.QUICK_TEST_START, { from })
    analytics.trackPageView('quick-test', { from })
  },

  onSelectOption(e) {
    const { key } = e.currentTarget.dataset
    const { currentIndex, questions, answers } = this.data
    const q = questions[currentIndex]
    const newAnswers = { ...answers, [q.id]: key }

    this.setData({ selectedKey: key, answers: newAnswers })

    setTimeout(() => {
      if (currentIndex + 1 >= TOTAL) {
        this._showResult(newAnswers)
        return
      }
      const next = currentIndex + 1
      this.setData({
        currentIndex: next,
        selectedKey: newAnswers[questions[next].id] || '',
        progress: Math.round(((next + 1) / TOTAL) * 100)
      })
    }, 280)
  },

  _showResult(answers) {
    const { type, confidence } = calculateResult(answers)
    const resultInfo = MBTI_TYPES[type]
    const resultGroup = resultInfo ? MBTI_GROUPS[resultInfo.group] : null

    app.saveMyMBTI(type)

    analytics.track(analytics.EVENTS.QUICK_TEST_COMPLETE, {
      type,
      confidence,
      from: this.data.from
    })
    analytics.track(analytics.EVENTS.TYPE_SELECTED, {
      type,
      method: 'quick_test',
      from: this.data.from
    })

    this.setData({
      step: 'result',
      resultType: type,
      resultInfo,
      resultGroup,
      confidence,
      progress: 100
    })
  },

  goBack() {
    if (this.data.step === 'result') {
      wx.navigateBack()
      return
    }
    if (this.data.currentIndex > 0) {
      const prev = this.data.currentIndex - 1
      const q = this.data.questions[prev]
      this.setData({
        currentIndex: prev,
        selectedKey: this.data.answers[q.id] || '',
        progress: Math.round(((prev + 1) / TOTAL) * 100)
      })
      return
    }
    wx.navigateBack()
  },

  goCard() {
    wx.redirectTo({
      url: `/pages/card/card?type=${this.data.resultType}`
    })
  },

  goMatch() {
    const { from, resultType } = this.data
    if (from === 'match') {
      const pages = getCurrentPages()
      const prev = pages[pages.length - 2]
      if (prev && prev.route === 'pages/match/match') {
        prev.setData({
          personality: {
            E: resultType[0] === 'E',
            N: resultType[1] === 'N',
            F: resultType[2] === 'F',
            J: resultType[3] === 'J'
          },
          myType: resultType,
          myTypeInfo: MBTI_TYPES[resultType],
          selectMethod: 'grid'
        })
        wx.navigateBack()
        return
      }
    }
    wx.redirectTo({ url: '/pages/invite/invite?type=' + resultType })
  },

  retake() {
    this.setData({
      step: 'quiz',
      currentIndex: 0,
      answers: {},
      selectedKey: '',
      progress: Math.round((1 / TOTAL) * 100),
      resultType: '',
      resultInfo: null,
      resultGroup: null,
      confidence: 0
    })
    analytics.track(analytics.EVENTS.QUICK_TEST_START, { from: this.data.from, retake: true })
  }
})
