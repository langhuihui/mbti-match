/**
 * llm-chat 云函数配置
 *
 * 使用云开发内置 AI 能力（cloud.extend.AI），无需 TokenHub API Key
 */

module.exports = {
  // 云开发 AI 模型配置
  AI_PROVIDER: 'cloudbase',
  AI_MODEL: 'qwen3.5-plus',

  // 危机关键词（云函数端二次检测）
  CRISIS_KEYWORDS: [
    '不想活', '想死', '自杀', '结束生命', '活不下去',
    '伤害自己', '自残', '了结', '跳楼', '吃药'
  ],

  // 最终分析 Prompt（要求 AI 输出结构化 JSON）
  ANALYZE_PROMPT: `基于以上完整对话，请输出结构化 JSON 分析结果。严格按以下格式输出，不要包含其他文字：

{
  "mbtiType": "INFJ",
  "typeName": "提倡者",
  "confidence": 0.82,
  "functionAnalysis": {
    "Ni": { "score": 8.5, "rank": 1, "confidence": 0.88, "evidence": [{"quote":"用户原话","interpretation":"解释","round":4}] },
    "Fe": { "score": 7.2, "rank": 2, "confidence": 0.80, "evidence": [] },
    "Ti": { "score": 5.1, "rank": 3, "confidence": 0.65, "evidence": [] },
    "Se": { "score": 2.3, "rank": 4, "confidence": 0.70, "evidence": [] },
    "Ne": { "score": 4.0, "rank": 5, "confidence": 0.60, "evidence": [] },
    "Fi": { "score": 3.5, "rank": 6, "confidence": 0.55, "evidence": [] },
    "Te": { "score": 3.0, "rank": 7, "confidence": 0.50, "evidence": [] },
    "Si": { "score": 2.0, "rank": 8, "confidence": 0.60, "evidence": [] }
  },
  "enneagramAnalysis": {
    "mainType": 4,
    "wing": 5,
    "subtype": "sx",
    "confidence": 0.80,
    "coreFear": "缺乏自我认同与独特性",
    "coreDesire": "找到真实的自我",
    "evidence": [{"quote":"用户原话","interpretation":"解释","round":6}],
    "wingEvidence": "叙事中混入5号的withdrawn倾向",
    "subtypeEvidence": "叙事围绕深度亲密关系"
  },
  "dimensionAnalysis": {
    "EI": {"E":0.3,"I":0.7,"confidence":0.85},
    "SN": {"S":0.2,"N":0.8,"confidence":0.90},
    "TF": {"T":0.4,"F":0.6,"confidence":0.75},
    "JP": {"J":0.65,"P":0.35,"confidence":0.70}
  },
  "riskAssessment": {"level":"low","flags":[],"notes":"正常范围"},
  "analystNote": "Ni-Fe 轴明显，4w5 sx 副型强化了内省深度",
  "styleSummary": "你善于在混沌中洞察本质，同时深切关怀身边人的感受",
  "growthSuggestion": "你的成长方向在于发展当下感知力(Se)，多关注此时此刻的真实体验"
}`
}
