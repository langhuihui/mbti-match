// pages/chat-assessment/chat-assessment.js
const llmService = require('../../utils/llmService')
const { WARMUP_MESSAGE, CRISIS_RESOURCES, MAX_ROUNDS, INSIGHT_START_ROUND, INSIGHT_READY_THRESHOLD } = require('../../config/llm')

// 话题引导建议（用户不知道聊什么时点击）
const TOPIC_SUGGESTIONS = [
  '最近有一件事让我印象很深',
  '我最近和朋友/家人有些矛盾',
  '我在想自己到底是个什么样的人',
  '最近有些困惑，想聊聊',
  '聊聊我小时候的故事吧',
]

const INPUT_PLACEHOLDERS = [
  '说说你最近在经历什么...',
  '多聊聊这件事，你当时是怎么想的？',
  '继续说说你的感受...',
  '你觉得这件事对你意味着什么？',
  '还有什么是你想分享的？',
]

Page({
  data: {
    messages: [],
    inputValue: '',
    loading: false,
    analyzing: false,
    sessionId: '',
    round: 0,
    maxRounds: MAX_ROUNDS,
    crisisResources: CRISIS_RESOURCES,
    showCrisisBanner: false,
    scrollToView: '',
    inputFocus: false,
    keyboardHeight: 0,
    statusBarHeight: 20,
    navBarHeight: 44,
    // 引导
    showTopicGuide: true,
    topicSuggestions: TOPIC_SUGGESTIONS,
    inputPlaceholder: INPUT_PLACEHOLDERS[0],
    // 流式消息标记
    streamingMsg: false,
    // 自动滚屏
    scrollTop: 0,
    // 信息掌握度（从 INSIGHT_START_ROUND 起每轮更新）
    insightProgress: 0,            // 0-100
    insightJungleanTilt: '',       // 如 "Ni>Fe>Ti>Se"
    insightEnneagramTilt: '',      // 如 "4号"
    insightSuggestion: '',         // AI 给的下一步建议
    insightReady: false,           // 掌握度是否已达可生成报告阈值
    insightStartRound: INSIGHT_START_ROUND,
    insightReadyThreshold: INSIGHT_READY_THRESHOLD,
  },

  onLoad() {
    try {
      const sysInfo = wx.getWindowInfo()
      const menuBtn = wx.getMenuButtonBoundingClientRect()
      this.setData({
        statusBarHeight: sysInfo.statusBarHeight || 20,
        navBarHeight: (menuBtn.top - (sysInfo.statusBarHeight || 20)) * 2 + menuBtn.height
      })
    } catch (e) {}

    // 诊断：检查云开发和 AI 能力
    const cloudReady = require('../../utils/cloudService').isCloudEnabled()
    const aiReady = !!(wx.cloud && wx.cloud.extend && wx.cloud.extend.AI)
    console.log('[chat] onLoad 诊断:', {
      cloudEnabled: cloudReady,
      aiAvailable: aiReady,
      libVersion: wx.getAppBaseInfo ? wx.getAppBaseInfo().SDKVersion : 'unknown'
    })
    if (!cloudReady) {
      console.error('[chat] 云开发未初始化！检查 app.js 是否调用了 cloudService.initCloud()，以及 config/cloud.js 的 CLOUD_ENV_ID')
    }
    if (!aiReady) {
      console.error('[chat] wx.cloud.extend.AI 不存在！基础库需 >= 3.7.1，当前:', wx.getAppBaseInfo ? wx.getAppBaseInfo().SDKVersion : 'unknown')
    }

    const sessionId = llmService.generateSessionId()

    // 尝试加载历史聊天记录
    const savedChat = this.loadChatHistory()
    if (savedChat && savedChat.messages && savedChat.messages.length > 1) {
      // 有历史记录，恢复
      this.setData({
        sessionId: savedChat.sessionId || sessionId,
        messages: savedChat.messages,
        round: savedChat.round || 0,
        insightProgress: savedChat.insightProgress || 0,
        insightJungleanTilt: savedChat.insightJungleanTilt || '',
        insightEnneagramTilt: savedChat.insightEnneagramTilt || '',
        insightReady: savedChat.insightReady || false,
      })
      console.log('[chat] 恢复历史聊天记录, round:', savedChat.round, 'msgs:', savedChat.messages.length)

      // 检查最后一条是否是用户消息（AI 还没回复就被退出了）
      const lastMsg = savedChat.messages[savedChat.messages.length - 1]
      if (lastMsg && lastMsg.role === 'user' && !lastMsg.error) {
        // 自动补发 AI 回复
        console.log('[chat] 检测到最后一条是用户消息，自动调用 AI 补发回复')
        setTimeout(() => this.resumeAIResponse(), 500)
      }
    } else {
      // 无历史，插入开场白
      const welcomeId = 'msg_welcome'
      this.setData({
        sessionId,
        messages: [{
          id: welcomeId,
          role: 'ai',
          content: WARMUP_MESSAGE,
          ts: Date.now()
        }],
        scrollToView: welcomeId
      })
    }

    // 延迟滚动到底部
    setTimeout(() => this.scrollToBottom(), 300)
  },

  // ====== 聊天记录持久化 ======

  // 恢复后自动补发 AI 回复（最后一条是用户消息时触发）
  async resumeAIResponse() {
    const messages = this.data.messages
    const lastMsg = messages[messages.length - 1]
    if (!lastMsg || lastMsg.role !== 'user') return

    // 插入 AI 占位消息
    const aiMsgId = 'msg_' + Date.now() + '_ai'
    const aiPlaceholder = {
      id: aiMsgId,
      role: 'ai',
      content: '',
      ts: Date.now(),
      streaming: true
    }
    this.setData({
      messages: messages.concat(aiPlaceholder),
      loading: true,
      streamingMsg: true,
      scrollToView: aiMsgId
    })
    this.scrollToBottom()

    // 构建历史对话（不含占位消息）
    const history = this.data.messages
      .filter(m => m.id !== aiMsgId)
      .map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content
      }))

    // 调用 AI
    const result = await llmService.sendChatMessage(
      this.data.sessionId,
      lastMsg.content,
      history,
      (chunk) => {
        const msgs = this.data.messages
        const aiIdx = msgs.findIndex(m => m.id === aiMsgId)
        if (aiIdx >= 0) {
          msgs[aiIdx].content += chunk
          this.setData({ messages: msgs, scrollToView: aiMsgId })
          this.scrollToBottom()
        }
      }
    )

    if (!result.success) {
      const msgs = this.data.messages
      const aiIdx = msgs.findIndex(m => m.id === aiMsgId)
      if (aiIdx >= 0) {
        msgs[aiIdx].content = result.error || '回复失败，请重新发送'
        msgs[aiIdx].streaming = false
        msgs[aiIdx].error = true
      }
      this.setData({ loading: false, streamingMsg: false, messages: msgs })
      return
    }

    // 更新最终内容
    const msgs = this.data.messages
    const aiIdx = msgs.findIndex(m => m.id === aiMsgId)
    if (aiIdx >= 0 && result.reply) {
      msgs[aiIdx].content = result.reply
      msgs[aiIdx].streaming = false
    }
    const newRound = result.round || (this.data.round + 1)

    // 更新掌握度
    const insightData = {}
    if (result.insight) {
      const ins = result.insight
      insightData.insightProgress = ins.progress || 0
      insightData.insightJungleanTilt = ins.jungleanTilt || ''
      insightData.insightEnneagramTilt = ins.enneagramTilt || ''
      insightData.insightSuggestion = ins.suggestion || ''
      insightData.insightReady = (ins.progress || 0) >= INSIGHT_READY_THRESHOLD
      if (aiIdx >= 0) {
        msgs[aiIdx].insight = {
          progress: ins.progress || 0,
          jungleanTilt: ins.jungleanTilt || '',
          enneagramTilt: ins.enneagramTilt || '',
          suggestion: ins.suggestion || ''
        }
      }
    }

    this.setData({
      messages: msgs,
      loading: false,
      streamingMsg: false,
      round: newRound,
      ...insightData
    })
    this.scrollToBottom()
    this.saveChatHistory()

    if (insightData.insightReady && newRound >= INSIGHT_START_ROUND + 2) {
      this._notifyReady()
    }
    if (llmService.shouldAnalyze(newRound)) {
      this.triggerAnalysis()
    }
  },

  // 保存聊天记录到本地存储
  saveChatHistory() {
    const data = {
      sessionId: this.data.sessionId,
      messages: this.data.messages.filter(m => !m.error),
      round: this.data.round,
      insightProgress: this.data.insightProgress,
      insightJungleanTilt: this.data.insightJungleanTilt,
      insightEnneagramTilt: this.data.insightEnneagramTilt,
      insightReady: this.data.insightReady,
      insightSuggestion: this.data.insightSuggestion,
      savedAt: Date.now()
    }
    try {
      wx.setStorageSync('chat_assessment_history', data)
    } catch (e) {
      console.warn('[chat] 保存聊天记录失败:', e)
    }
  },

  // 加载本地聊天记录
  loadChatHistory() {
    try {
      return wx.getStorageSync('chat_assessment_history') || null
    } catch (e) {
      return null
    }
  },

  // 清空聊天记录
  onClearChat() {
    wx.showModal({
      title: '清空对话',
      content: '确定清空当前所有对话记录吗？这将重新开始一次测定。',
      confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('chat_assessment_history')
          const sessionId = llmService.generateSessionId()
          const welcomeId = 'msg_welcome'
          this.setData({
            sessionId,
            messages: [{
              id: welcomeId,
              role: 'ai',
              content: WARMUP_MESSAGE,
              ts: Date.now()
            }],
            round: 0,
            inputValue: '',
            loading: false,
            analyzing: false,
            streamingMsg: false,
            showTopicGuide: true,
            insightProgress: 0,
            insightJungleanTilt: '',
            insightEnneagramTilt: '',
            insightSuggestion: '',
            insightReady: false,
            scrollToView: welcomeId,
            inputPlaceholder: INPUT_PLACEHOLDERS[0]
          })
          this._readyNotified = false
          wx.showToast({ title: '已清空，重新开始', icon: 'none' })
        }
      }
    })
  },

  // 页面隐藏/卸载时保存
  onHide() {
    this.saveChatHistory()
  },

  onUnload() {
    this.saveChatHistory()
  },

  onInput(e) {
    this.setData({ inputValue: e.detail.value })
  },

  onInputFocus(e) {
    this.setData({
      inputFocus: true,
      keyboardHeight: e.detail.height || 0
    })
  },

  onInputBlur() {
    this.setData({ inputFocus: false, keyboardHeight: 0 })
  },

  // 点击话题引导
  onTopicTap(e) {
    const topic = e.currentTarget.dataset.topic
    this.setData({
      inputValue: topic,
      showTopicGuide: false,
    })
    // 自动聚焦输入框
    this.setData({ inputFocus: true })
  },

  // 发送消息
  async onSend() {
    const content = (this.data.inputValue || '').trim()
    console.log('[chat] onSend 触发, content:', content ? content.substring(0, 20) : '(空)', 'loading:', this.data.loading)
    if (!content || this.data.loading || this.data.analyzing) return

    // 隐藏话题引导
    this.setData({ showTopicGuide: false })

    // 追加用户消息
    const userMsgId = 'msg_' + Date.now()
    const userMsg = {
      id: userMsgId,
      role: 'user',
      content,
      ts: Date.now()
    }

    // 先插入 AI 占位消息（流式用）
    const aiMsgId = 'msg_' + Date.now() + '_ai'
    const aiPlaceholder = {
      id: aiMsgId,
      role: 'ai',
      content: '',
      ts: Date.now(),
      streaming: true
    }

    this.setData({
      messages: this.data.messages.concat(userMsg, aiPlaceholder),
      inputValue: '',
      loading: true,
      streamingMsg: true,
      scrollToView: aiMsgId,
      inputPlaceholder: INPUT_PLACEHOLDERS[Math.min(this.data.round + 1, INPUT_PLACEHOLDERS.length - 1)]
    })
    this.scrollToBottom()

    // 构建历史对话
    const history = this.data.messages
      .filter(m => m.id !== aiMsgId)
      .map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content
      }))

    // 调用云开发 AI（流式回调）
    console.log('[chat] 开始调用 AI, sessionId:', this.data.sessionId, 'historyLen:', history.length)
    const result = await llmService.sendChatMessage(
      this.data.sessionId,
      content,
      history,
      (chunk) => {
        const msgs = this.data.messages
        const aiIdx = msgs.findIndex(m => m.id === aiMsgId)
        if (aiIdx >= 0) {
          msgs[aiIdx].content += chunk
          this.setData({
            messages: msgs,
            scrollToView: aiMsgId
          })
          this.scrollToBottom()
        }
      }
    )
    console.log('[chat] AI 调用结果:', result.success, result.error || 'ok')

    if (!result.success) {
      const errorMsg = result.error || '发送失败，请重试'
      console.error('[chat] 调用失败详情:', errorMsg)
      wx.showToast({ title: errorMsg.substring(0, 30), icon: 'none', duration: 3000 })
      const msgs = this.data.messages
      const aiIdx = msgs.findIndex(m => m.id === aiMsgId)
      if (aiIdx >= 0) {
        msgs[aiIdx].content = errorMsg
        msgs[aiIdx].streaming = false
        msgs[aiIdx].error = true
      }
      this.setData({ loading: false, streamingMsg: false, messages: msgs })
      this.scrollToBottom()
      return
    }

    // 危机信号
    if (result.crisis) {
      this.setData({ showCrisisBanner: true })
    }

    // 确保最终内容完整（已剥离元信息块，纯正文）
    const msgs = this.data.messages
    const aiIdx = msgs.findIndex(m => m.id === aiMsgId)
    if (aiIdx >= 0 && result.reply) {
      msgs[aiIdx].content = result.reply
      msgs[aiIdx].streaming = false
    }
    const newRound = result.round || (this.data.round + 1)

    // 处理信息掌握度元信息（从 INSIGHT_START_ROUND 起 AI 会附带）
    const insightData = {}
    if (result.insight) {
      const ins = result.insight
      insightData.insightProgress = ins.progress || 0
      insightData.insightJungleanTilt = ins.jungleanTilt || ''
      insightData.insightEnneagramTilt = ins.enneagramTilt || ''
      insightData.insightSuggestion = ins.suggestion || ''
      insightData.insightReady = (ins.progress || 0) >= INSIGHT_READY_THRESHOLD

      // 同时把 insight 挂到该条 AI 消息上，便于在气泡下方展示小标签
      if (aiIdx >= 0) {
        msgs[aiIdx].insight = {
          progress: ins.progress || 0,
          jungleanTilt: ins.jungleanTilt || '',
          enneagramTilt: ins.enneagramTilt || '',
          suggestion: ins.suggestion || ''
        }
      }
    }

    this.setData({
      messages: msgs,
      loading: false,
      streamingMsg: false,
      round: newRound,
      sessionId: result.sessionId || this.data.sessionId,
      ...insightData
    })
    this.scrollToBottom()
    this.saveChatHistory()  // 每轮结束后保存记录

    // 达到判定条件：自动触发分析
    // 优先看掌握度是否已 ready（提前结束），其次看是否达到最大轮次
    if (insightData.insightReady && newRound >= INSIGHT_START_ROUND + 2) {
      // 掌握度达标且至少聊了 insightStart+2 轮，提示用户可生成报告（不强制）
      this._notifyReady()
    }
    if (llmService.shouldAnalyze(newRound)) {
      this.triggerAnalysis()
    }
  },

  // 自动滚动到底部（节流，最多200ms一次）
  scrollToBottom() {
    if (this._scrollTimer) return
    this._scrollTimer = setTimeout(() => {
      this._scrollTimer = null
      const query = wx.createSelectorQuery().in(this)
      query.select('.message-list').boundingClientRect()
      query.select('.message-list').scrollOffset()
      query.exec((res) => {
        if (res && res[1]) {
          this.setData({ scrollTop: res[1].scrollHeight + 200 })
        }
      })
    }, 150)
  },

  // 掌握度达标时的轻提示（不自动跳转，由用户决定）
  _notifyReady() {
    if (this._readyNotified) return
    this._readyNotified = true
    wx.showToast({
      title: '信息已较充分，可生成报告',
      icon: 'none',
      duration: 2500
    })
  },

  // 触发最终分析
  async triggerAnalysis() {
    if (this.data.analyzing) return
    this.setData({ analyzing: true })

    wx.showLoading({ title: '正在生成分析报告...', mask: true })

    const history = this.data.messages
      .filter(m => !m.error)
      .map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content
      }))

    const result = await llmService.getAssessmentAnalysis(this.data.sessionId, history)

    wx.hideLoading()

    if (!result.success || !result.analysis) {
      this.setData({ analyzing: false })
      wx.showModal({
        title: '分析失败',
        content: result.error || '请稍后重试，或继续对话后再试',
        showCancel: false
      })
      return
    }

    const app = getApp()
    if (app && app.globalData) {
      app.globalData.lastAssessment = {
        sessionId: this.data.sessionId,
        analysis: result.analysis,
        createdAt: Date.now()
      }
    }

    this.setData({ analyzing: false })

    wx.redirectTo({
      url: '/pages/result/result?from=chat&sessionId=' + this.data.sessionId,
      fail: () => {
        wx.showModal({
          title: '分析完成',
          content: '已生成你的人格分析报告。',
          showCancel: false,
          success: () => {
            wx.switchTab({ url: '/pages/index/index' })
          }
        })
      }
    })
  },

  // 手动结束并分析
  onEndChat() {
    if (this.data.analyzing) return
    // 掌握度已达标：直接允许结束（不论轮次）
    if (this.data.insightReady) {
      wx.showModal({
        title: '生成报告',
        content: '当前信息掌握度已达 ' + this.data.insightProgress + '%，确定现在生成分析报告吗？',
        success: (res) => {
          if (res.confirm) {
            this.triggerAnalysis()
          }
        }
      })
      return
    }
    if (this.data.round < 3) {
      wx.showToast({ title: '再多聊几句吧', icon: 'none' })
      return
    }
    const hint = this.data.insightProgress > 0
      ? '当前信息掌握度 ' + this.data.insightProgress + '%，可能还不够充分。确定现在就开始生成分析报告吗？'
      : '确定现在就开始生成分析报告吗？'
    wx.showModal({
      title: '结束对话',
      content: hint,
      success: (res) => {
        if (res.confirm) {
          this.triggerAnalysis()
        }
      }
    })
  },

  onBack() {
    if (this.data.messages.length > 1) {
      wx.showModal({
        title: '离开对话',
        content: '当前对话进度不会保存，确定离开吗？',
        success: (res) => {
          if (res.confirm) wx.navigateBack()
        }
      })
    } else {
      wx.navigateBack()
    }
  },

  onCloseCrisis() {
    this.setData({ showCrisisBanner: false })
  },

  onCopyCrisis() {
    wx.setClipboardData({ data: '心理援助热线：400-161-9995' })
  }
})
