// MBTI类型数据
export const MBTI_TYPES = {
  'INTJ': {
    name: '建筑师',
    image: 'https://static.neris-assets.com/images/personality-types/avatars/intj-architect.svg',
    functions: ['Ni', 'Te', 'Fi', 'Se', 'Ne', 'Ti', 'Fe', 'Si']
  },
  'INTP': {
    name: '逻辑学家',
    image: 'https://static.neris-assets.com/images/personality-types/avatars/intp-logician.svg',
    functions: ['Ti', 'Ne', 'Si', 'Fe', 'Te', 'Ni', 'Se', 'Fi']
  },
  'ENTJ': {
    name: '指挥官',
    image: 'https://static.neris-assets.com/images/personality-types/avatars/entj-commander.svg',
    functions: ['Te', 'Ni', 'Se', 'Fi', 'Ti', 'Ne', 'Si', 'Fe']
  },
  'ENTP': {
    name: '辩论家',
    image: 'https://static.neris-assets.com/images/personality-types/avatars/entp-debater.svg',
    functions: ['Ne', 'Ti', 'Fe', 'Si', 'Ni', 'Te', 'Fi', 'Se']
  },
  'INFJ': {
    name: '提倡者',
    image: 'https://static.neris-assets.com/images/personality-types/avatars/infj-advocate.svg',
    functions: ['Ni', 'Fe', 'Ti', 'Se', 'Ne', 'Fi', 'Te', 'Si']
  },
  'INFP': {
    name: '调停者',
    image: 'https://static.neris-assets.com/images/personality-types/avatars/infp-mediator.svg',
    functions: ['Fi', 'Ne', 'Si', 'Te', 'Fe', 'Ni', 'Se', 'Ti']
  },
  'ENFJ': {
    name: '主人公',
    image: 'https://static.neris-assets.com/images/personality-types/avatars/enfj-protagonist.svg',
    functions: ['Fe', 'Ni', 'Se', 'Ti', 'Fi', 'Ne', 'Si', 'Te']
  },
  'ENFP': {
    name: '竞选者',
    image: 'https://static.neris-assets.com/images/personality-types/avatars/enfp-campaigner.svg',
    functions: ['Ne', 'Fi', 'Te', 'Si', 'Ni', 'Fe', 'Ti', 'Se']
  },
  'ISTJ': {
    name: '物流师',
    image: 'https://static.neris-assets.com/images/personality-types/avatars/istj-logistician.svg',
    functions: ['Si', 'Te', 'Fi', 'Ne', 'Se', 'Ti', 'Fe', 'Ni']
  },
  'ISFJ': {
    name: '守卫者',
    image: 'https://static.neris-assets.com/images/personality-types/avatars/isfj-defender.svg',
    functions: ['Si', 'Fe', 'Ti', 'Ne', 'Se', 'Fi', 'Te', 'Ni']
  },
  'ESTJ': {
    name: '总经理',
    image: 'https://static.neris-assets.com/images/personality-types/avatars/estj-executive.svg',
    functions: ['Te', 'Si', 'Ne', 'Fi', 'Ti', 'Se', 'Ni', 'Fe']
  },
  'ESFJ': {
    name: '执政官',
    image: 'https://static.neris-assets.com/images/personality-types/avatars/esfj-consul.svg',
    functions: ['Fe', 'Si', 'Ne', 'Ti', 'Fi', 'Se', 'Ni', 'Te']
  },
  'ISTP': {
    name: '鉴赏家',
    image: 'https://static.neris-assets.com/images/personality-types/avatars/istp-virtuoso.svg',
    functions: ['Ti', 'Se', 'Ni', 'Fe', 'Te', 'Si', 'Ne', 'Fi']
  },
  'ISFP': {
    name: '探险家',
    image: 'https://static.neris-assets.com/images/personality-types/avatars/isfp-adventurer.svg',
    functions: ['Fi', 'Se', 'Ni', 'Te', 'Fe', 'Si', 'Ne', 'Ti']
  },
  'ESTP': {
    name: '企业家',
    image: 'https://static.neris-assets.com/images/personality-types/avatars/estp-entrepreneur.svg',
    functions: ['Se', 'Ti', 'Fe', 'Ni', 'Si', 'Te', 'Fi', 'Ne']
  },
  'ESFP': {
    name: '表演者',
    image: 'https://static.neris-assets.com/images/personality-types/avatars/esfp-entertainer.svg',
    functions: ['Se', 'Fi', 'Te', 'Ni', 'Si', 'Fe', 'Ti', 'Ne']
  }
}

// 认知功能描述映射
export const COGNITIVE_FUNCTION_DESCRIPTIONS = {
  'Fi': {
    name: '内倾情感',
    description: '关注内在的价值观和情感体验，重视个人的真实感受'
  },
  'Fe': {
    name: '外倾情感',
    description: '关注外在的情感氛围和人际和谐，善于理解和回应他人情感'
  },
  'Ti': {
    name: '内倾思维',
    description: '追求逻辑的精确性和内在一致性，喜欢深入分析问题'
  },
  'Te': {
    name: '外倾思维',
    description: '注重效率和客观结果，善于组织和执行'
  },
  'Ni': {
    name: '内倾直觉',
    description: '关注深层含义和未来趋势，善于洞察和预见'
  },
  'Ne': {
    name: '外倾直觉',
    description: '发现各种可能性和联系，富有创造力和想象力'
  },
  'Si': {
    name: '内倾感知',
    description: '重视经验和细节，注重传统和稳定性'
  },
  'Se': {
    name: '外倾感知',
    description: '关注当下的实际体验，善于把握现场和应对变化'
  }
}

// 功能位分析
export const FUNCTION_POSITION_ANALYSIS = {
  // 主导功能（第一功能位）与主导功能的关系
  dominant: {
    'Fi-Fe': '一个重视内在价值观，一个重视外在和谐，需要互相理解对方处理情感的方式。建议：多表达自己的感受，同时也要尊重对方的情感需求。',
    'Fi-Te': '一个重视情感体验，一个重视逻辑效率，可能在决策方式上有分歧。建议：在重要决定时，既考虑情感因素也考虑实际因素。',
    'Fe-Ti': '一个善于处理人际关系，一个擅长逻辑分析，能互补但也可能有沟通障碍。建议：结合感性和理性的视角来处理问题。',
    'Te-Ti': '都重视逻辑思维，但处理方式不同，可能在执行方式上有分歧。建议：相互学习对方的思维方式，取长补短。',
    'Ni-Ne': '都具有直觉思维，但一个倾向深度，一个倾向广度。建议：结合双方的洞察力，既要有远见也要保持开放。',
    'Si-Se': '一个重视经验和细节，一个重视当下和体验，在生活节奏上可能有差异。建议：平衡计划性和自发性，互相体谅对方的生活方式。'
  },
  // 辅助功能（第二功能位）的互动
  auxiliary: {
    'Ne-Ni': '在处理可能性时有不同视角，可以带来创新的火花。建议：多分享各自的想法，共同探索未来。',
    'Se-Si': '对待现实的态度不同，可以互相补充对细节和体验的理解。建议：既要享受当下，也要注意长期规划。',
    'Fe-Fi': '处理情感的方式不同，可以学习对方的情感智慧。建议：保持开放和理解的态度，欣赏对方的情感表达方式。',
    'Te-Ti': '思维方式互补，可以带来全面的问题解决方案建议：在决策时综合考虑双方的分析方式。'
  }
}

// MBTI类型顺序（按N/S、I/E、F/T、P/J排序）
export const MBTI_TYPE_ORDER = [
  // N类型
  'INFP', 'INFJ', 'INTP', 'INTJ',  // IN类型
  'ENFP', 'ENFJ', 'ENTP', 'ENTJ',  // EN类型
  // S类型
  'ISFP', 'ISFJ', 'ISTP', 'ISTJ',  // IS类型
  'ESFP', 'ESFJ', 'ESTP', 'ESTJ'   // ES类型
]

// 关系描述
export const RELATIONSHIP_DESCRIPTIONS = {
  '本体': '同型：类型学中的镜像',
  '衬托': '能力互补，重心相反',
  '全反': '和对方功能顺序刚相反',
  '新奇': '有趣的、相互不同',
  '陪伴': '在一起工作玩耍都很愉快，天生冲突很小',
  '邻居': '以不同方式到达同一个地方',
  '对比': '职能顺序相同，而外向和内向性刚好相反',
  '顾问': '各自拥有对方在某方面欠缺的洞察力',
  '同族': '共享一种文化的感觉，但是兴趣点和能力又不同',
  '对手': '在完全不同的领域使用类似的职能',
  '陌生': '在几乎任何一方面都完全陌生',
  '室友': '能够共同使用一个空间，喜欢相同的环境，但是目标和价值观不一定相似',
  '互补': '类似伙伴，但是职能相差很远；相互可以增强对方力量',
  '老师': '互相既是对方的老师也是对方的学生；有种家长和孩子的感觉',
  '支持': '互相对经验上的冒险所吸引'
} 