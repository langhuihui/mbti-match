/**
 * LLM 对话测定客户端服务封装
 *
 * 使用微信云开发内置 AI 能力（wx.cloud.extend.AI），
 * 无需对接 TokenHub，无需管理 API Key，原生流式输出。
 *
 * 架构：
 *   - 对话调用：小程序端直接调 wx.cloud.extend.AI（流式，3行代码）
 *   - 分析+存储：仍走云函数 llm-chat（保存完整分析记录到云数据库）
 *
 * 提供能力：
 *   - sendChatMessage(sessionId, userMessage, history) 单轮对话（流式）
 *   - getAssessmentAnalysis(sessionId)                 最终结构化分析
 *   - generateSessionId()                             会话 ID 生成
 *   - parseInsight(reply)                             解析 AI 回复中的掌握度元信息
 *   - stripInsightBlock(reply)                        剥离元信息块，返回纯对话内容
 */
const { MAX_ROUNDS, INSIGHT_START_ROUND } = require('../config/llm')
const { callFunction, isCloudEnabled } = require('./cloudService')

/**
 * 生成会话 ID
 */
function generateSessionId() {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10)
}

/**
 * 检测危机关键词（客户端预检，云函数会再做一次）
 */
const CRISIS_KEYWORDS = [
  '不想活', '想死', '自杀', '结束生命', '活不下去',
  '伤害自己', '自残', '了结', '跳楼', '吃药'
]

function detectCrisis(text) {
  return CRISIS_KEYWORDS.some(kw => text.includes(kw))
}

// ====== 信息掌握度元信息解析 ======

// 元信息块起止标签（必须与 config/llm.js 中 SYSTEM_PROMPT 定义保持一致）
const INSIGHT_OPEN = '<!--INSIGHT-->'
const INSIGHT_CLOSE = '<!--/INSIGHT-->'

/**
 * 判断某轮是否应让 AI 返回掌握度元信息
 * @param {number} round 当前用户已回复轮次（从 1 开始）
 */
function shouldReturnInsight(round) {
  return round && round >= INSIGHT_START_ROUND
}

/**
 * 从 AI 完整回复中解析出掌握度元信息
 *
 * 元信息块格式：
 *   <!--INSIGHT-->
 *   掌握度:65
 *   荣格倾向:Ni>Fe>Ti>Se
 *   九型倾向:4号
 *   建议:可以继续聊聊你做决定时的场景
 *   <!--/INSIGHT-->
 *
 * @param {string} reply AI 完整回复
 * @returns {{progress:number, jungleanTilt:string, enneagramTilt:string, suggestion:string}|null}
 */
function parseInsight(reply) {
  if (!reply || typeof reply !== 'string') return null

  const startIdx = reply.indexOf(INSIGHT_OPEN)
  const endIdx = reply.indexOf(INSIGHT_CLOSE)
  if (startIdx < 0 || endIdx <= startIdx) return null

  const block = reply.substring(startIdx + INSIGHT_OPEN.length, endIdx)
  const result = {
    progress: 0,
    jungleanTilt: '',
    enneagramTilt: '',
    suggestion: ''
  }

  block.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (!trimmed) return

    // 用 indexOf 定位冒号，避免硬编码字段名长度（中文长度易错）
    const colonIdx = trimmed.indexOf(':')
    if (colonIdx < 0) return
    const key = trimmed.substring(0, colonIdx)
    const value = trimmed.substring(colonIdx + 1).trim()

    if (key === '掌握度') {
      const val = parseInt(value, 10)
      if (!isNaN(val)) result.progress = Math.max(0, Math.min(100, val))
    } else if (key === '荣格倾向') {
      result.jungleanTilt = value
    } else if (key === '九型倾向') {
      result.enneagramTilt = value
    } else if (key === '建议') {
      result.suggestion = value
    }
  })

  return result
}

/**
 * 剥离元信息块，返回纯对话内容（展示给用户的正文）
 * 同时会清理元信息块前可能存在的多余空行
 *
 * @param {string} reply AI 完整回复
 * @returns {string} 去除元信息块后的纯文本
 */
function stripInsightBlock(reply) {
  if (!reply || typeof reply !== 'string') return reply || ''

  const startIdx = reply.indexOf(INSIGHT_OPEN)
  if (startIdx < 0) return reply

  const endIdx = reply.indexOf(INSIGHT_CLOSE)
  if (endIdx < 0) {
    // 只有开标签没有闭标签（流式输出中途），截掉开标签及之后内容
    return reply.substring(0, startIdx).replace(/\s+$/, '')
  }

  // 移除元信息块及其前后的多余空行
  const before = reply.substring(0, startIdx).replace(/\s+$/, '')
  const after = reply.substring(endIdx + INSIGHT_CLOSE.length).replace(/^\s+/, '')
  return (before + (after ? '\n' + after : '')).trim()
}

/**
 * 流式输出时的安全截断：如果当前 chunk 拼接后已经出现开标签，
 * 说明元信息块开始，应停止向用户展示后续内容。
 * 返回当前可安全展示的部分（已剥离开标签及之后内容）。
 *
 * @param {string} accumulated 当前累计文本
 * @returns {string} 可安全展示的部分
 */
function safeStreamContent(accumulated) {
  if (!accumulated) return ''
  const startIdx = accumulated.indexOf(INSIGHT_OPEN)
  if (startIdx < 0) return accumulated
  return accumulated.substring(0, startIdx).replace(/\s+$/, '')
}

/**
 * 计算可立即输出的安全长度。
 * 即使 safeStreamContent 未检测到完整开标签，
 * 若 safe 末尾恰好是 INSIGHT_OPEN 的部分前缀（如 "<!--"、"<!--INS"），
 * 也应暂缓输出，等下一个 chunk 确认后再决定，避免用户看到标签碎片。
 *
 * @param {string} safe 经 safeStreamContent 处理后的文本
 * @returns {number} 可立即输出的字符数
 */
function safeOutputLength(safe) {
  if (!safe) return 0
  const maxOverlap = Math.min(safe.length, INSIGHT_OPEN.length)
  for (let len = maxOverlap; len > 0; len--) {
    if (safe.endsWith(INSIGHT_OPEN.substring(0, len))) {
      return safe.length - len
    }
  }
  return safe.length
}

/**
 * 发送一条用户消息，获取 AI 回复（流式回调）
 *
 * 直接调用 wx.cloud.extend.AI，无需经过云函数代理。
 * System Prompt 从 config/llm.js 读取，保持在小程序端。
 *
 * 流式回调 onStream 只会收到"可展示给用户"的对话正文部分，
 * 元信息块（掌握度等）会被自动剥离，最终通过返回值 insight 字段提供。
 *
 * @param {string} sessionId 会话 ID
 * @param {string} userMessage 用户输入
 * @param {Array} history 历史对话 [{role, content}]
 * @param {function} onStream 流式回调，每收到一段文本就调用 (textChunk) => {}
 * @returns {Promise<{success:boolean, sessionId:string, reply:string, insight?:object, crisis?:boolean, round?:number, error?:string}>}
 */
async function sendChatMessage(sessionId, userMessage, history = [], onStream = null) {
  if (!userMessage || !userMessage.trim()) {
    return { success: false, error: '消息不能为空' }
  }

  // 危机检测
  if (detectCrisis(userMessage)) {
    const { CRISIS_RESOURCES } = require('../config/llm')
    return {
      success: true,
      sessionId,
      reply: '我听到了你此刻的痛苦。请记住你不是一个人。' + CRISIS_RESOURCES,
      crisis: true
    }
  }

  if (!isCloudEnabled()) {
    console.error('[llmService] 云开发未启用，isCloudEnabled=false')
    return { success: false, error: '云开发未启用，请检查云环境配置' }
  }

  // 检查 wx.cloud.extend.AI 是否存在
  if (!wx.cloud || !wx.cloud.extend || !wx.cloud.extend.AI) {
    console.error('[llmService] wx.cloud.extend.AI 不存在，基础库版本可能过低（需 3.7.1+）')
    return { success: false, error: 'AI 能力不可用，请升级微信基础库至 3.7.1 以上' }
  }

  try {
    const { SYSTEM_PROMPT, AI_PROVIDER, AI_MODEL } = require('../config/llm')

    // 构建消息列表
    // 防重复：如果 history 最后一条就是当前 userMessage，就不再 append
    const normalizedHistory = history.map(h => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content
    }))
    const lastHistMsg = normalizedHistory[normalizedHistory.length - 1]
    const userMsg = { role: 'user', content: userMessage.trim() }
    const isDuplicate = lastHistMsg && lastHistMsg.role === 'user' && lastHistMsg.content === userMsg.content

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...normalizedHistory,
      ...(isDuplicate ? [] : [userMsg])
    ]

    // 尝试调用云开发 AI（支持多模型降级）
    // 按官方示例使用 eventStream 解析，兼容 textStream
    const models = [
      { provider: AI_PROVIDER || 'cloudbase', model: AI_MODEL || 'hy3' },
    ]

    let fullReply = ''
    let lastError = null

    for (const m of models) {
      try {
        console.log('[llmService] 尝试 provider:', m.provider, 'model:', m.model)
        const model = wx.cloud.extend.AI.createModel(m.provider)
        const res = await model.streamText({
          data: { model: m.model, messages }
        })

        let streamedUpTo = 0

        // 优先使用 eventStream（官方推荐方式）
        if (res.eventStream) {
          console.log('[llmService] 使用 eventStream 模式')
          let eventCount = 0
          for await (let event of res.eventStream) {
            if (event.data === '[DONE]') break

            if (eventCount < 3) {
              console.log('[llmService] event#' + eventCount + ':', typeof event.data === 'string' ? event.data.substring(0, 100) : event.data)
            }
            eventCount++

            try {
              const data = JSON.parse(event.data)
              const delta = data?.choices?.[0]?.delta
              // 同时检查 content 和 reasoning_content
              const text = delta?.content || ''
              const think = delta?.reasoning_content || ''  // 思维链

              if (text) {
                fullReply += text
                if (onStream) {
                  const safe = safeStreamContent(fullReply)
                  const outputLen = safeOutputLength(safe)
                  if (outputLen > streamedUpTo) {
                    onStream(safe.substring(streamedUpTo, outputLen))
                    streamedUpTo = outputLen
                  }
                }
              }
              // 思维链不展示给用户，但记录到 fullReply 以便后续处理
              if (think) {
                console.log('[llmService] (思维链片段)', think.substring(0, 50))
              }
            } catch (e) {
              // 非 JSON 格式的 event.data，当纯文本处理
              if (typeof event.data === 'string' && event.data !== '[DONE]') {
                fullReply += event.data
                if (onStream) {
                  const safe = safeStreamContent(fullReply)
                  const outputLen = safeOutputLength(safe)
                  if (outputLen > streamedUpTo) {
                    onStream(safe.substring(streamedUpTo, outputLen))
                    streamedUpTo = outputLen
                  }
                }
              }
            }
          }
          console.log('[llmService] eventStream 结束, 共收到', eventCount, '个事件, 回复长度:', fullReply.length)
        }
        // 兼容 textStream（旧版 SDK）
        else if (res.textStream) {
          console.log('[llmService] 使用 textStream 模式')
          for await (let chunk of res.textStream) {
            fullReply += chunk
            if (onStream) {
              const safe = safeStreamContent(fullReply)
              const outputLen = safeOutputLength(safe)
              if (outputLen > streamedUpTo) {
                onStream(safe.substring(streamedUpTo, outputLen))
                streamedUpTo = outputLen
              }
            }
          }
        }

        console.log('[llmService] 回复长度:', fullReply.length)

        // 检查是否收到了有效回复
        if (fullReply && fullReply.trim()) {
          break  // 成功，跳出重试循环
        }
        console.warn('[llmService] 模型', m.model, '返回空回复')
      } catch (err) {
        console.warn('[llmService] 模型', m.model, '调用失败:', err.message)
        lastError = err
        fullReply = ''
      }
    }

    // 所有模型都失败或返回空
    if (!fullReply || !fullReply.trim()) {
      const errHint = lastError ? lastError.message : 'AI 返回空回复'
      console.error('[llmService] 所有模型均失败，最后错误:', errHint)
      return {
        success: false,
        sessionId,
        error: 'AI 服务暂时不可用（可能配额已用完或被限流），请稍后再试。详细: ' + errHint
      }
    }

    // 最终剥离元信息块，得到纯对话正文
    const cleanReply = stripInsightBlock(fullReply)
    // 解析元信息（若有）
    const insight = parseInsight(fullReply)

    return {
      success: true,
      sessionId,
      reply: cleanReply,
      insight: insight || undefined,
      round: Math.floor(history.filter(h => h.role === 'user').length / 2) + 1
    }
  } catch (err) {
    console.error('[llmService] AI 调用失败:', err)
    return {
      success: false,
      sessionId,
      error: err && err.message ? err.message : 'AI 调用失败，请稍后重试'
    }
  }
}

/**
 * 获取最终结构化分析
 *
 * 仍通过云函数 llm-chat 处理：
 *   1. 云函数读取完整对话历史
 *   2. 调用云开发 AI 输出结构化 JSON
 *   3. 保存到云数据库 assessments 集合
 *   4. 返回用户可见的裁剪结果
 *
 * @param {string} sessionId
 * @param {Array} history 完整对话历史（从页面传入，避免云函数重新读取）
 * @returns {Promise<{success:boolean, sessionId:string, analysis?:object, error?:string}>}
 */
async function getAssessmentAnalysis(sessionId, history = []) {
  if (!sessionId) {
    return { success: false, error: '缺少 sessionId' }
  }

  try {
    const result = await callFunction('llm-chat', {
      action: 'analyze',
      sessionId,
      history  // 直接传入历史，减少一次数据库读取
    })
    if (!result) {
      return { success: false, sessionId, error: '云函数返回为空' }
    }
    return result
  } catch (err) {
    return {
      success: false,
      sessionId,
      error: err && err.message ? err.message : '分析失败，请稍后重试'
    }
  }
}

/**
 * 判断是否应触发最终分析
 * @param {number} round 当前轮次
 */
function shouldAnalyze(round) {
  return round && round >= MAX_ROUNDS
}

module.exports = {
  sendChatMessage,
  getAssessmentAnalysis,
  generateSessionId,
  shouldAnalyze,
  shouldReturnInsight,
  detectCrisis,
  parseInsight,
  stripInsightBlock,
  safeStreamContent,
  MAX_ROUNDS,
  INSIGHT_START_ROUND
}
