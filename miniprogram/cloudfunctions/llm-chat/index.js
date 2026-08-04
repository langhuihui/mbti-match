/**
 * llm-chat 云函数（简化版）
 *
 * 架构变更后职责：
 *   - 对话轮次：由小程序端直接调 wx.cloud.extend.AI（流式），不经此云函数
 *   - 最终分析：仍由本云函数处理，调用云开发 AI 输出结构化 JSON，存入云数据库
 *
 * 不再对接 TokenHub，改用 wx-server-sdk 内置的 cloud.extend.AI
 */

const cloud = require('wx-server-sdk')
const config = require('./config')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const { action, sessionId, history } = event

  if (action !== 'analyze') {
    return { success: false, error: `不支持的操作: ${action}` }
  }

  if (!sessionId) {
    return { success: false, error: '缺少 sessionId' }
  }

  // 历史对话：优先用客户端传入的，否则从数据库读取
  let messages = []
  if (history && history.length > 0) {
    messages = history.map(m => ({
      role: m.role,
      content: m.content
    }))
  } else {
    // 从会话记录读取
    try {
      const sessionRes = await db.collection('assessments_sessions').doc(sessionId).get()
      messages = (sessionRes.data.messages || []).map(m => ({
        role: m.role,
        content: m.content
      }))
    } catch (e) {
      return { success: false, error: '会话记录不存在，请传入 history 参数' }
    }
  }

  if (messages.length < 3) {
    return { success: false, error: '对话轮次不足，无法分析' }
  }

  try {
    // 危机检测
    const fullText = messages.map(m => m.content).join(' ')
    const crisisHit = config.CRISIS_KEYWORDS.some(kw => fullText.includes(kw))

    // 调用云开发 AI 做结构化分析
    // createModel 参数是 provider/GroupName，不是模型名
    const model = cloud.extend.AI.createModel(config.AI_PROVIDER || 'cloudbase')

    const analysisMessages = [
      ...messages,
      { role: 'user', content: config.ANALYZE_PROMPT }
    ]

    const res = await model.streamText({
      data: {
        model: config.AI_MODEL || 'hy3',
        messages: analysisMessages,
        temperature: 0.2,
      }
    })

    let rawResult = ''
    for await (let chunk of res.textStream) {
      rawResult += chunk
    }

    // 提取 JSON
    const analysis = extractJSON(rawResult)

    if (!analysis) {
      return {
        success: false,
        error: 'AI 分析结果格式异常',
        rawResult
      }
    }

    // 保存完整分析到云数据库
    const assessmentRecord = {
      sessionId,
      conversation: messages,
      ...analysis,
      riskAssessment: {
        ...analysis.riskAssessment,
        crisisDetected: crisisHit,
      },
      createdAt: db.serverDate(),
    }

    const saveRes = await db.collection('assessments').add({ data: assessmentRecord })

    // 返回用户可见的裁剪结果
    const userView = {
      assessmentId: saveRes._id,
      mbtiType: analysis.mbtiType,
      typeName: analysis.typeName || '',
      functionRanking: buildFunctionRanking(analysis.functionAnalysis),
      overallConfidence: analysis.confidence || 0,
      enneagramHint: String(analysis.enneagramAnalysis?.mainType || ''),
      styleSummary: analysis.styleSummary || '',
      growthSuggestion: analysis.growthSuggestion || '',
      assessmentDate: new Date().toISOString(),
    }

    return { success: true, sessionId, analysis: userView }

  } catch (err) {
    return {
      success: false,
      sessionId,
      error: err.message || String(err)
    }
  }
}

/**
 * 从 AI 输出文本中提取 JSON
 */
function extractJSON(text) {
  if (!text) return null

  // 尝试直接解析
  try {
    return JSON.parse(text)
  } catch (e) {}

  // 尝试提取 ```json ... ``` 块
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1])
    } catch (e) {}
  }

  // 尝试提取第一个 { 到最后一个 }
  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1))
    } catch (e) {}
  }

  return null
}

/**
 * 构建用户可见的功能排序（仅排序+置信度，不含证据链）
 */
function buildFunctionRanking(functionAnalysis) {
  if (!functionAnalysis) return []

  return Object.entries(functionAnalysis)
    .map(([code, data]) => ({
      function: code,
      rank: data.rank,
      confidence: data.confidence > 0.8 ? 'high' : data.confidence > 0.6 ? 'medium' : 'low'
    }))
    .sort((a, b) => (a.rank || 99) - (b.rank || 99))
}
