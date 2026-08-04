/**
 * 关系人话摘要（面向小白被邀请者）
 */
const PLAIN_SUMMARIES = {
  '本体': '你们是同一类型，思维方式几乎一模一样，默契度拉满。',
  '衬托': '你们像硬币的两面，强项互补，合作起来特别合拍。',
  '全反': '你们每个维度都相反，吸引力很强，但也需要更多耐心理解彼此。',
  '新奇': '你们有足够的新鲜感，相处时总有新发现，不容易腻。',
  '陪伴': '这是最轻松的关系之一，待在一起就很舒服，几乎不用刻意经营。',
  '邻居': '目标相似但路径不同，能互相借鉴，也能带来新视角。',
  '对比': '用同一套认知工具，但方向相反，既懂对方又能互补。',
  '顾问': '你们能互相点醒对方的盲区，在一起容易一起成长。',
  '同族': '价值观和文化感相近，聊得来，在具体能力上又能互补。',
  '对手': '有竞争张力，也能互相激发，适合一起搞事、一起进步。',
  '陌生': '差异很大，需要主动破冰；一旦走近，成长空间也最大。',
  '室友': '生活习惯合拍，能舒服共处，深层目标可能需要多沟通。',
  '互补': '像拼图的两块，各补所短，深度合作能 1+1>2。',
  '伙伴': '想法和行动方式很合拍，合作、做朋友都很省心。',
  '老师': '你们会轮流当对方的老师，这段关系很有教育意义。',
  '支持': '彼此欣赏对方的生活方式，愿意支持对方去探索和冒险。'
}

const LEVEL_LABELS = {
  5: '非常合拍',
  4: '相当契合',
  3: '中等默契',
  2: '需要磨合',
  1: '挑战较大'
}

const LEVEL_TIPS = {
  5: '保持现在的相处节奏就好，你们天然很同步。',
  4: '多聊聊彼此的想法，优势会越来越明显。',
  3: '尊重差异，找到共同话题，关系会稳步升温。',
  2: '先理解再评判，给彼此多一点耐心。',
  1: '差异大不代表不合适，主动沟通是关键。'
}

function getPlainSummary(relationKey, relation) {
  if (PLAIN_SUMMARIES[relationKey]) {
    return PLAIN_SUMMARIES[relationKey]
  }
  if (relation && relation.desc) {
    return relation.desc
  }
  return '你们之间有着独特的认知化学反应，值得慢慢探索。'
}

function getLevelLabel(level) {
  return LEVEL_LABELS[level] || LEVEL_LABELS[3]
}

function getLevelTip(level) {
  return LEVEL_TIPS[level] || LEVEL_TIPS[3]
}

function buildResultBrief(type1, type2, relationKey, relation) {
  const name = relation.name || relationKey
  const level = relation.level || 3
  return {
    headline: `${type1} × ${type2} = ${relation.emoji || ''} ${name}`,
    summary: getPlainSummary(relationKey, relation),
    levelLabel: getLevelLabel(level),
    tip: getLevelTip(level)
  }
}

module.exports = {
  getPlainSummary,
  getLevelLabel,
  getLevelTip,
  buildResultBrief
}
