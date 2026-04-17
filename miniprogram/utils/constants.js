// MBTI 类型完整数据
const MBTI_TYPES = {
  'INTJ': {
    name: '建筑师', subtitle: 'Architect',
    image: '/images/avatars/intj-architect.svg',
    functions: ['Ni', 'Te', 'Fi', 'Se', 'Ne', 'Ti', 'Fe', 'Si'],
    tags: ['战略家', '独立', '高效'],
    motto: '万事皆有更优解',
    quote: '我不需要被所有人理解，但我需要理解所有事物的本质。',
    group: 'NT'
  },
  'INTP': {
    name: '逻辑学家', subtitle: 'Logician',
    image: '/images/avatars/intp-logician.svg',
    functions: ['Ti', 'Ne', 'Si', 'Fe', 'Te', 'Ni', 'Se', 'Fi'],
    tags: ['分析者', '创新', '好奇'],
    motto: '质疑一切，思考一切',
    quote: '在我的脑海中，有一个永远在运转的思维实验室。',
    group: 'NT'
  },
  'ENTJ': {
    name: '指挥官', subtitle: 'Commander',
    image: '/images/avatars/entj-commander.svg',
    functions: ['Te', 'Ni', 'Se', 'Fi', 'Ti', 'Ne', 'Si', 'Fe'],
    tags: ['领导者', '果断', '远见'],
    motto: '不存在无法解决的问题',
    quote: '给我一个目标，我会规划出通往它的最佳路径。',
    group: 'NT'
  },
  'ENTP': {
    name: '辩论家', subtitle: 'Debater',
    image: '/images/avatars/entp-debater.svg',
    functions: ['Ne', 'Ti', 'Fe', 'Si', 'Ni', 'Te', 'Fi', 'Se'],
    tags: ['创新者', '机智', '挑战'],
    motto: '规则是用来质疑的',
    quote: '每一场对话都是一次思想的冒险。',
    group: 'NT'
  },
  'INFJ': {
    name: '提倡者', subtitle: 'Advocate',
    image: '/images/avatars/infj-advocate.svg',
    functions: ['Ni', 'Fe', 'Ti', 'Se', 'Ne', 'Fi', 'Te', 'Si'],
    tags: ['洞察者', '理想', '共情'],
    motto: '在混沌中看到意义',
    quote: '我总是能感受到别人未曾说出口的话。',
    group: 'NF'
  },
  'INFP': {
    name: '调停者', subtitle: 'Mediator',
    image: '/images/avatars/infp-mediator.svg',
    functions: ['Fi', 'Ne', 'Si', 'Te', 'Fe', 'Ni', 'Se', 'Ti'],
    tags: ['理想家', '温暖', '创意'],
    motto: '忠于内心的声音',
    quote: '世界的美好，在于每个灵魂都可以自由地绽放。',
    group: 'NF'
  },
  'ENFJ': {
    name: '主人公', subtitle: 'Protagonist',
    image: '/images/avatars/enfj-protagonist.svg',
    functions: ['Fe', 'Ni', 'Se', 'Ti', 'Fi', 'Ne', 'Si', 'Te'],
    tags: ['引领者', '热情', '感召'],
    motto: '点亮他人，成就彼此',
    quote: '我相信每个人都有无限的潜力，我愿意帮助你发现。',
    group: 'NF'
  },
  'ENFP': {
    name: '竞选者', subtitle: 'Campaigner',
    image: '/images/avatars/enfp-campaigner.svg',
    functions: ['Ne', 'Fi', 'Te', 'Si', 'Ni', 'Fe', 'Ti', 'Se'],
    tags: ['探索者', '热忱', '自由'],
    motto: '生命是一场值得拥抱的冒险',
    quote: '每一天都是新故事的开始，每个人都是有趣的章节。',
    group: 'NF'
  },
  'ISTJ': {
    name: '物流师', subtitle: 'Logistician',
    image: '/images/avatars/istj-logistician.svg',
    functions: ['Si', 'Te', 'Fi', 'Ne', 'Se', 'Ti', 'Fe', 'Ni'],
    tags: ['可靠者', '严谨', '务实'],
    motto: '责任是最高的美德',
    quote: '我用行动证明承诺，用细节构筑信任。',
    group: 'SJ'
  },
  'ISFJ': {
    name: '守卫者', subtitle: 'Defender',
    image: '/images/avatars/isfj-defender.svg',
    functions: ['Si', 'Fe', 'Ti', 'Ne', 'Se', 'Fi', 'Te', 'Ni'],
    tags: ['守护者', '温柔', '奉献'],
    motto: '默默守护所珍视的一切',
    quote: '最深的爱，是在细微之处给予温暖。',
    group: 'SJ'
  },
  'ESTJ': {
    name: '总经理', subtitle: 'Executive',
    image: '/images/avatars/estj-executive.svg',
    functions: ['Te', 'Si', 'Ne', 'Fi', 'Ti', 'Se', 'Ni', 'Fe'],
    tags: ['执行者', '坚定', '秩序'],
    motto: '规则让世界更美好',
    quote: '高效的组织和清晰的规则，是通向成功的基石。',
    group: 'SJ'
  },
  'ESFJ': {
    name: '执政官', subtitle: 'Consul',
    image: '/images/avatars/esfj-consul.svg',
    functions: ['Fe', 'Si', 'Ne', 'Ti', 'Fi', 'Se', 'Ni', 'Te'],
    tags: ['关怀者', '和善', '社交'],
    motto: '让每个人都感到被重视',
    quote: '和谐的关系是我生活中最重要的旋律。',
    group: 'SJ'
  },
  'ISTP': {
    name: '鉴赏家', subtitle: 'Virtuoso',
    image: '/images/avatars/istp-virtuoso.svg',
    functions: ['Ti', 'Se', 'Ni', 'Fe', 'Te', 'Si', 'Ne', 'Fi'],
    tags: ['工匠', '冷静', '灵巧'],
    motto: '用双手解构世界',
    quote: '我不需要说明书，给我工具就够了。',
    group: 'SP'
  },
  'ISFP': {
    name: '探险家', subtitle: 'Adventurer',
    image: '/images/avatars/isfp-adventurer.svg',
    functions: ['Fi', 'Se', 'Ni', 'Te', 'Fe', 'Si', 'Ne', 'Ti'],
    tags: ['艺术家', '自由', '感性'],
    motto: '活在当下，感受美好',
    quote: '真正的美，藏在每一个不经意的瞬间里。',
    group: 'SP'
  },
  'ESTP': {
    name: '企业家', subtitle: 'Entrepreneur',
    image: '/images/avatars/estp-entrepreneur.svg',
    functions: ['Se', 'Ti', 'Fe', 'Ni', 'Si', 'Te', 'Fi', 'Ne'],
    tags: ['行动派', '大胆', '务实'],
    motto: '做了再说',
    quote: '机会转瞬即逝，我从不犹豫。',
    group: 'SP'
  },
  'ESFP': {
    name: '表演者', subtitle: 'Entertainer',
    image: '/images/avatars/esfp-entertainer.svg',
    functions: ['Se', 'Fi', 'Te', 'Ni', 'Si', 'Fe', 'Ti', 'Ne'],
    tags: ['表演家', '热情', '快乐'],
    motto: '人生就是一场盛大的派对',
    quote: '快乐是可以传染的，而我就是那个超级传播者。',
    group: 'SP'
  }
}

// 认知功能详细描述
const COGNITIVE_FUNCTIONS = {
  'Ni': {
    name: '内倾直觉', abbr: 'Ni',
    description: '关注深层含义和未来趋势，善于洞察和预见',
    detail: '通过内在的直觉洞察事物的深层模式，聚焦于未来的可能性和长远趋势',
    color: '#8b5cf6'
  },
  'Ne': {
    name: '外倾直觉', abbr: 'Ne',
    description: '发现各种可能性和联系，富有创造力和想象力',
    detail: '在外部世界中发现联系和可能性，善于头脑风暴和创意发散',
    color: '#f59e0b'
  },
  'Si': {
    name: '内倾感觉', abbr: 'Si',
    description: '重视经验和细节，注重传统和稳定性',
    detail: '通过内在的感官记忆重现过去的经验，重视传统、细节和稳定',
    color: '#10b981'
  },
  'Se': {
    name: '外倾感觉', abbr: 'Se',
    description: '关注当下的实际体验，善于把握现场和应对变化',
    detail: '完全沉浸在当下的感官体验中，对环境变化有敏锐的觉察力',
    color: '#ef4444'
  },
  'Ti': {
    name: '内倾思维', abbr: 'Ti',
    description: '追求逻辑的精确性和内在一致性，喜欢深入分析',
    detail: '建立内在的逻辑框架，追求思维的精确性和一致性',
    color: '#3b82f6'
  },
  'Te': {
    name: '外倾思维', abbr: 'Te',
    description: '注重效率和客观结果，善于组织和执行',
    detail: '用客观标准衡量事物，注重效率、结果和系统化的组织',
    color: '#06b6d4'
  },
  'Fi': {
    name: '内倾情感', abbr: 'Fi',
    description: '关注内在的价值观和情感体验，重视真实感受',
    detail: '深入探索内在的价值观和情感，追求真实性和个人意义',
    color: '#ec4899'
  },
  'Fe': {
    name: '外倾情感', abbr: 'Fe',
    description: '关注人际和谐和他人情感，善于建立社交连接',
    detail: '关注群体的情感氛围，善于理解、回应他人情感并维护和谐',
    color: '#f97316'
  }
}

// 八维功能位名称
const FUNCTION_POSITIONS = [
  { name: '主导功能', desc: '你最强大的能力，核心驱动力', color: '#3b82f6' },
  { name: '辅助功能', desc: '平衡主导的得力助手', color: '#10b981' },
  { name: '第三功能', desc: '成长空间，中年后发展', color: '#f59e0b' },
  { name: '劣势功能', desc: '盲区所在，也是成长之钥', color: '#ef4444' },
  { name: '对抗功能', desc: '主导的影子面', color: '#8b5cf6' },
  { name: '批判功能', desc: '辅助的影子面', color: '#ec4899' },
  { name: '欺骗功能', desc: '第三的影子面', color: '#06b6d4' },
  { name: '魔鬼功能', desc: '劣势的影子面', color: '#64748b' }
]

// MBTI 类型顺序
const MBTI_TYPE_ORDER = [
  'INFP', 'INFJ', 'INTP', 'INTJ',
  'ENFP', 'ENFJ', 'ENTP', 'ENTJ',
  'ISFP', 'ISFJ', 'ISTP', 'ISTJ',
  'ESFP', 'ESFJ', 'ESTP', 'ESTJ'
]

// 族群分组
const MBTI_GROUPS = {
  NT: { name: '分析家', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)', types: ['INTJ', 'INTP', 'ENTJ', 'ENTP'] },
  NF: { name: '外交家', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)', types: ['INFJ', 'INFP', 'ENFJ', 'ENFP'] },
  SJ: { name: '守护者', color: '#0ea5e9', bgColor: 'rgba(14, 165, 233, 0.1)', types: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'] },
  SP: { name: '探索者', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)', types: ['ISTP', 'ISFP', 'ESTP', 'ESFP'] }
}

// 关系类型完整数据
const RELATIONSHIP_TYPES = {
  '本体': {
    emoji: '≡', name: '本体', subtitle: '同型镜像',
    desc: '你们拥有完全相同的认知功能栈，如同灵魂的镜像。',
    detail: '作为同一类型，你们天然理解彼此的思维方式和行为模式。但相似也意味着可能放大彼此的盲区。',
    color: '#6366f1', level: 5
  },
  '衬托': {
    emoji: '◑', name: '衬托', subtitle: '能力互补',
    desc: '能力互补，重心相反，如同硬币的两面。',
    detail: '你们的核心能力形成互补，一个人的强项恰好是对方的发展区。在合作中可以形成强大的团队。',
    color: '#8b5cf6', level: 4
  },
  '全反': {
    emoji: '⇄', name: '全反', subtitle: '功能逆序',
    desc: '认知功能完全相反，是彼此最神秘的存在。',
    detail: '你们的每一个维度都是对立的，这带来了极大的吸引力但也意味着需要更多的理解和包容。',
    color: '#ef4444', level: 2
  },
  '新奇': {
    emoji: '✦', name: '新奇', subtitle: '相互好奇',
    desc: '彼此感到新鲜有趣，充满探索的欲望。',
    detail: '你们有足够的不同来保持新鲜感，又有基础的共同点来维持连接。这是一段充满惊喜的关系。',
    color: '#f59e0b', level: 3
  },
  '陪伴': {
    emoji: '∞', name: '陪伴', subtitle: '天然和谐',
    desc: '在一起工作玩耍都很愉快，天生冲突很小。',
    detail: '你们之间有着天然的舒适感，不需要刻意经营就能相处融洽。是最轻松的关系类型之一。',
    color: '#10b981', level: 5
  },
  '邻居': {
    emoji: '⊞', name: '邻居', subtitle: '殊途同归',
    desc: '以不同方式到达同一个地方。',
    detail: '你们的目标和价值观相似，但达成目标的方式截然不同。这种差异可以带来互补的视角。',
    color: '#06b6d4', level: 4
  },
  '对比': {
    emoji: '⇌', name: '对比', subtitle: '同序反向',
    desc: '功能顺序相同，但外向与内向性刚好相反。',
    detail: '你们使用相同的认知功能，但能量方向相反。这让你们既能理解彼此，又能带来不同的视角。',
    color: '#8b5cf6', level: 3
  },
  '顾问': {
    emoji: '◇', name: '顾问', subtitle: '互相启发',
    desc: '各自拥有对方在某方面欠缺的洞察力。',
    detail: '你们在关键领域互为导师，能够帮助对方看到自己的盲区。这是一段充满成长的关系。',
    color: '#3b82f6', level: 4
  },
  '同族': {
    emoji: '△', name: '同族', subtitle: '文化相通',
    desc: '共享一种文化感觉，但兴趣点和能力不同。',
    detail: '你们有着相似的价值基础和文化认同，但在具体能力和兴趣上互补。是一种温暖而丰富的关系。',
    color: '#10b981', level: 4
  },
  '对手': {
    emoji: '×', name: '对手', subtitle: '良性竞争',
    desc: '在完全不同的领域使用类似的功能。',
    detail: '你们有着相似的能力但应用在不同的领域，这种关系既充满竞争张力，也蕴含着相互学习的机会。',
    color: '#ef4444', level: 3
  },
  '陌生': {
    emoji: '…', name: '陌生', subtitle: '平行宇宙',
    desc: '在几乎任何方面都完全陌生。',
    detail: '你们像是来自平行宇宙的人，很难找到共同语言。但如果能突破这层隔阂，反而能带来最大的成长。',
    color: '#64748b', level: 1
  },
  '室友': {
    emoji: '⊟', name: '室友', subtitle: '共享空间',
    desc: '喜欢相同的环境，但目标和价值观可能不同。',
    detail: '你们能够舒适地共享物理空间，生活习惯相似，但在深层的目标追求上可能大相径庭。',
    color: '#06b6d4', level: 3
  },
  '互补': {
    emoji: '⊕', name: '互补', subtitle: '拼图搭档',
    desc: '相互可以增强对方的力量。',
    detail: '你们如同拼图的两片，各自补全对方的空缺。在深度合作中能够创造1+1>2的效果。',
    color: '#ec4899', level: 4
  },
  '伙伴': {
    emoji: '∥', name: '伙伴', subtitle: '志同道合',
    desc: '有着相似的价值追求和行动方式。',
    detail: '你们在很多方面都很合拍，能够自然地理解对方的想法和行动。是非常舒适的合作关系。',
    color: '#10b981', level: 4
  },
  '老师': {
    emoji: '▷', name: '老师', subtitle: '教学相长',
    desc: '互为老师和学生，有家长与孩子的感觉。',
    detail: '在不同的领域，你们轮流扮演老师和学生的角色。这种关系充满了教育意义和成长机会。',
    color: '#3b82f6', level: 3
  },
  '支持': {
    emoji: '☆', name: '支持', subtitle: '冒险同盟',
    desc: '互相被对方的经验冒险所吸引。',
    detail: '你们都对对方的生活方式和冒险经历感到着迷。在支持彼此探索未知的过程中建立了深厚的连接。',
    color: '#f59e0b', level: 4
  }
}

// 碰撞类型
const COLLISION_TYPES = {
  resonance: { name: '共鸣', emoji: '●', desc: '相同位置的相同功能', color: '#10b981' },
  complement: { name: '互补', emoji: '◐', desc: '强势功能对应弱势功能', color: '#3b82f6' },
  clash: { name: '碰撞', emoji: '✕', desc: '相同位置的对立功能', color: '#ef4444' },
  weave: { name: '交织', emoji: '∿', desc: '功能在不同位置交错出现', color: '#8b5cf6' }
}

// 族群颜色（保持向后兼容）
const MBTI_GROUP_COLORS = {
  NT: '#8b5cf6',
  NF: '#10b981',
  SJ: '#0ea5e9',
  SP: '#f59e0b'
}

module.exports = {
  MBTI_TYPES,
  COGNITIVE_FUNCTIONS,
  FUNCTION_POSITIONS,
  MBTI_TYPE_ORDER,
  MBTI_GROUPS,
  RELATIONSHIP_TYPES,
  COLLISION_TYPES,
  MBTI_GROUP_COLORS
}
