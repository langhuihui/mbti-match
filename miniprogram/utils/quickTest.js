/**
 * 12 题 MBTI 快测
 * 每维度 3 题，多数票决定字母；平局取该维度最后一题答案。
 */
const QUESTIONS = [
  {
    id: 1,
    dim: 'EI',
    text: '周末你更愿意？',
    options: [
      { key: 'E', label: '和朋友聚会、外出活动' },
      { key: 'I', label: '在家独处、充电休息' }
    ]
  },
  {
    id: 2,
    dim: 'EI',
    text: '在陌生社交场合，你通常？',
    options: [
      { key: 'E', label: '主动开口、很快融入' },
      { key: 'I', label: '先观察、等别人搭话' }
    ]
  },
  {
    id: 3,
    dim: 'EI',
    text: '忙碌一天后，你更想？',
    options: [
      { key: 'E', label: '找人聊聊、分享今天' },
      { key: 'I', label: '安静待着、不被打扰' }
    ]
  },
  {
    id: 4,
    dim: 'SN',
    text: '你更关注？',
    options: [
      { key: 'S', label: '眼前具体的事实和细节' },
      { key: 'N', label: '背后的可能性和趋势' }
    ]
  },
  {
    id: 5,
    dim: 'SN',
    text: '学习新东西时，你偏好？',
    options: [
      { key: 'S', label: '按步骤、从实操入手' },
      { key: 'N', label: '先理解大框架和原理' }
    ]
  },
  {
    id: 6,
    dim: 'SN',
    text: '你更相信？',
    options: [
      { key: 'S', label: '亲身经历和可验证的数据' },
      { key: 'N', label: '直觉、灵感和联想' }
    ]
  },
  {
    id: 7,
    dim: 'TF',
    text: '做决定时，你更看重？',
    options: [
      { key: 'T', label: '逻辑是否合理、是否公平' },
      { key: 'F', label: '对他人的影响和感受' }
    ]
  },
  {
    id: 8,
    dim: 'TF',
    text: '指出别人问题时，你倾向于？',
    options: [
      { key: 'T', label: '直接说问题所在' },
      { key: 'F', label: '委婉表达、照顾情绪' }
    ]
  },
  {
    id: 9,
    dim: 'TF',
    text: '你认为更重要的是？',
    options: [
      { key: 'T', label: '客观公正、就事论事' },
      { key: 'F', label: '关系和谐、彼此理解' }
    ]
  },
  {
    id: 10,
    dim: 'JP',
    text: '你更喜欢？',
    options: [
      { key: 'J', label: '提前计划、按计划执行' },
      { key: 'P', label: '灵活应变、随时调整' }
    ]
  },
  {
    id: 11,
    dim: 'JP',
    text: '面对截止日期，你通常？',
    options: [
      { key: 'J', label: '提前完成、留有余地' },
      { key: 'P', label: '临近截止才冲刺' }
    ]
  },
  {
    id: 12,
    dim: 'JP',
    text: '你的生活节奏更像？',
    options: [
      { key: 'J', label: '有条理、可预期' },
      { key: 'P', label: '随性、充满变化' }
    ]
  }
]

const DIM_MAP = {
  EI: ['E', 'I'],
  SN: ['S', 'N'],
  TF: ['T', 'F'],
  JP: ['J', 'P']
}

function calculateResult(answers) {
  // answers: { questionId: 'E' | 'I' | ... }
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
  const lastPick = { EI: null, SN: null, TF: null, JP: null }

  QUESTIONS.forEach((q) => {
    const pick = answers[q.id]
    if (!pick) return
    if (scores[pick] !== undefined) scores[pick]++
    lastPick[q.dim] = pick
  })

  function resolveDim(dimKey) {
    const [a, b] = DIM_MAP[dimKey]
    if (scores[a] > scores[b]) return a
    if (scores[b] > scores[a]) return b
    return lastPick[dimKey] || a
  }

  const type = [
    resolveDim('EI'),
    resolveDim('SN'),
    resolveDim('TF'),
    resolveDim('JP')
  ].join('')

  const totalAnswered = Object.keys(answers).length
  const confidence = Math.round((totalAnswered / QUESTIONS.length) * 100)

  return {
    type,
    confidence,
    scores,
    isQuickTest: true
  }
}

module.exports = {
  QUESTIONS,
  TOTAL: QUESTIONS.length,
  calculateResult
}
