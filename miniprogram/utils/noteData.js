/**
 * 笔记数据管理模块
 * Phase 0: 本地存储
 * Phase 1: 迁移到云数据库
 */

const { MBTI_TYPES, MBTI_GROUPS } = require('./constants')

// ====== 话题分类 ======
const TOPICS = {
  moment: { name: '关系瞬间', icon: '💫', desc: '匹配后的一句话' },
  featured: { name: '精选', icon: '⭐', desc: '编辑推荐阅读' },
  all: { name: '全部', icon: '🌟', desc: '所有内容' },
  daily: { name: '日常感悟', icon: '✨', desc: '分享你的MBTI日常' },
  relationship: { name: '关系心得', icon: '💑', desc: '类型间的碰撞故事' },
  growth: { name: '成长笔记', icon: '🌱', desc: '认知功能发展记录' },
  funny: { name: '类型趣事', icon: '😂', desc: 'MBTI梗和有趣瞬间' },
  insight: { name: '深度解读', icon: '🔍', desc: '八维功能深度分析' },
  workplace: { name: '职场观察', icon: '💼', desc: 'MBTI在职场的体现' }
}

const TOPIC_LIST = Object.keys(TOPICS).map(key => ({
  key,
  ...TOPICS[key]
}))

// ====== 示例笔记数据（上线前展示用） ======
const SAMPLE_NOTES = [
  {
    id: 'sample_001',
    author: { nickname: '星空漫步者', avatarUrl: '', mbtiType: 'INFP', mbtiGroup: 'NF' },
    title: 'INFP的日常：在想象中环游世界',
    content: '作为一个INFP，我的脑子里永远有一个平行世界。开会的时候看着窗外的云，就能脑补出一整部小说的剧情。\n\n别人觉得我在发呆，其实我在进行一场史诗级的内心冒险 🌈\n\nFi主导让我对每件事都有强烈的个人感受，Ne辅助让这些感受变成了无穷无尽的可能性。有时候觉得做INFP很累，因为世界上有那么多美好的事物，我的心装不下了。\n\n但也正因如此，每一个平凡的瞬间，都能成为我灵感的来源 ✨',
    images: [],
    tags: ['INFP', 'Fi', 'Ne', '日常'],
    topic: 'daily',
    likes: 128,
    comments: 23,
    isLiked: false,
    isFavorited: false,
    createTime: '2026-04-16T10:30:00',
    isSample: true
  },
  {
    id: 'sample_002',
    author: { nickname: '逻辑工程师', avatarUrl: '', mbtiType: 'INTJ', mbtiGroup: 'NT' },
    title: '为什么INTJ总被说"冷漠"？',
    content: '我不是冷漠，我只是在优先处理更重要的信息。\n\nNi主导意味着我的大脑一直在后台运行复杂的模式识别。当别人在闲聊天气的时候，我可能正在推演一个项目未来三个月的发展轨迹。\n\nTe辅助让我习惯用效率来衡量一切——包括社交。所以如果我觉得一段对话没有信息增量，确实会选择省略寒暄直奔主题。\n\n但这不代表我不在乎。恰恰相反，对于我认定的少数人，我愿意花大量时间帮他们解决问题。只是我的"在乎"更像是帮你做了一份人生规划Excel，而不是问你"今天开心吗"😅\n\n#Ni洞察力 #Te执行力 #被误解的温柔',
    images: [],
    tags: ['INTJ', 'Ni', 'Te', '深度解读'],
    topic: 'insight',
    likes: 256,
    comments: 47,
    isLiked: false,
    isFavorited: false,
    createTime: '2026-04-15T16:20:00',
    isSample: true
  },
  {
    id: 'sample_003',
    author: { nickname: '社交蝴蝶', avatarUrl: '', mbtiType: 'ENFP', mbtiGroup: 'NF' },
    title: 'ENFP × INTJ：最不可能却最深刻的友谊',
    content: '我的好闺蜜是个INTJ，我们的相处模式简直就是教科书级别的互补关系 📖\n\n她帮我把天马行空的想法变成可执行的计划——\n"你说要学吉他？好，我已经帮你列了一个三个月的学习路线图。"\n\n我帮她走出社交舒适区——\n"走！今天有个新开的展览，别在家刷论文了！"\n\n我们的Ne和Ni碰撞出了无数精彩的深夜对话。她的洞察力让我叹服，我的热情也在慢慢融化她的"冰山"外表。\n\n最感动的是，当我因为太多想法而焦虑时，她会帮我理清思路说："你最想要的到底是什么？" 这就是Te的力量吧 💪\n\n互补关系真的太奇妙了！',
    images: [],
    tags: ['ENFP', 'INTJ', '互补关系', '友谊'],
    topic: 'relationship',
    likes: 342,
    comments: 65,
    isLiked: false,
    isFavorited: false,
    createTime: '2026-04-14T22:15:00',
    isSample: true
  },
  {
    id: 'sample_004',
    author: { nickname: '稳定输出机', avatarUrl: '', mbtiType: 'ISTJ', mbtiGroup: 'SJ' },
    title: '职场中最被低估的能力：Si的力量',
    content: 'Si（内倾感觉）经常被认为是"保守""无聊"的功能。但在职场中，Si主导者才是真正的定海神针。\n\n我们记得每一个重要的细节——\n📋 去年那个项目的复盘数据\n📋 客户三个月前提过的一个小需求\n📋 公司流程变更的所有版本\n\n当别人在头脑风暴的时候，我们在确保基础不会崩塌。\n\n"创新很重要，但没有人检查消防通道是否通畅的话，大家都在玩火。"\n\nSi + Te的组合让我成为团队里最可靠的人。不是最耀眼的，但绝对是最不可或缺的。\n\n致敬所有默默在岗位上精确运转的SJ守护者们 🫡',
    images: [],
    tags: ['ISTJ', 'Si', 'Te', '职场'],
    topic: 'workplace',
    likes: 187,
    comments: 31,
    isLiked: false,
    isFavorited: false,
    createTime: '2026-04-14T09:00:00',
    isSample: true
  },
  {
    id: 'sample_005',
    author: { nickname: '灵魂段子手', avatarUrl: '', mbtiType: 'ENTP', mbtiGroup: 'NT' },
    title: '每种类型被追问"你到底喜不喜欢我"的反应',
    content: '📌 INTJ：分析了你们关系的ROI后给出一份报告\n📌 INTP：陷入"喜欢的哲学定义是什么"的思考循环\n📌 ENTJ：把你安排进了五年规划\n📌 ENTP：反问"喜欢有17种定义你说的是哪种"\n\n📌 INFJ：在你问之前已经用Ni预判了你要问\n📌 INFP：写了一首诗但没有发给你\n📌 ENFJ：已经在策划你们的未来了\n📌 ENFP：说喜欢！然后明天又觉得隔壁ISTP也很酷\n\n📌 ISTJ：每天帮你记得吃药就是答案\n📌 ISFJ：默默记住了你的所有喜好\n📌 ESTJ：把"恋爱"列为待办事项并设了deadline\n📌 ESFJ：已经通知了全世界\n\n📌 ISTP：修好了你坏掉的东西\n📌 ISFP：画了一幅你的肖像\n📌 ESTP：直接亲你\n📌 ESFP：策划了一场超浪漫的surprise\n\n你被cue到了吗？😆',
    images: [],
    tags: ['ENTP', '所有类型', '段子', '恋爱'],
    topic: 'funny',
    likes: 892,
    comments: 156,
    isLiked: false,
    isFavorited: false,
    createTime: '2026-04-13T20:45:00',
    isSample: true
  },
  {
    id: 'sample_006',
    author: { nickname: '治愈系咨询师', avatarUrl: '', mbtiType: 'ENFJ', mbtiGroup: 'NF' },
    title: '如何用八维认知功能理解你的"内心冲突"',
    content: '很多人会说"我有时候像这个类型，有时候像那个类型"。其实这不是你"测不准"，而是你的八维功能栈在不同场景下有不同的表现。\n\n🧠 主导功能：你最自然、最舒适的思维方式\n🤝 辅助功能：帮助主导功能与外界交互\n🌀 第三功能：你的"内在小孩"，创意但不成熟\n⚡ 劣势功能：你的盲点，也是成长的突破口\n\n举个例子：一个ENFJ（Fe-Ni-Se-Ti）\n\n平时的我：热情、善于协调、关注他人感受（Fe主导）\n做决策时：直觉式洞察、看到大趋势（Ni辅助）\n压力大时：突然想去逛街、运动、吃好吃的（Se第三——寻求感官安慰）\n崩溃时：过度分析、钻牛角尖、变得尖锐（Ti劣势——grip状态）\n\n理解这些，就不会再对自己的"矛盾"感到困惑了 💗\n\n你的功能栈告诉你的故事是什么？',
    images: [],
    tags: ['ENFJ', 'Fe', '八维认知', '心理成长'],
    topic: 'growth',
    likes: 445,
    comments: 78,
    isLiked: false,
    isFavorited: false,
    createTime: '2026-04-13T14:30:00',
    isSample: true
  },
  {
    id: 'sample_007',
    author: { nickname: '行动派冒险家', avatarUrl: '', mbtiType: 'ESTP', mbtiGroup: 'SP' },
    title: 'Se主导者的生活哲学：活在当下不是鸡汤',
    content: '所有人都在说"活在当下"，但对于Se主导者来说，这不是一种选择，而是我们的默认设置。\n\n我不太理解为什么有些人（看向Ni们 👀）要花那么多时间思考"未来的意义"。对我来说：\n\n🏄‍♂️ 好浪来了就冲，别分析浪的哲学意义\n🍜 好吃的就现在吃，别算明天的卡路里\n🎯 机会来了就抓，别做SWOT分析\n\n当然，我也在学习成长——Ti辅助帮我在冲动前多想一秒（虽然只有一秒），Ni劣势在提醒我偶尔也该看看远方。\n\n但生命太短了，不是吗？与其在脑海里把一件事分析成1000种可能性，不如先做了再说。最坏的结果无非就是一个好故事 📖\n\n#ESTP #Se #活在当下 #体验派',
    images: [],
    tags: ['ESTP', 'Se', '生活哲学'],
    topic: 'daily',
    likes: 267,
    comments: 42,
    isLiked: false,
    isFavorited: false,
    createTime: '2026-04-12T18:00:00',
    isSample: true
  },
  {
    id: 'sample_008',
    author: { nickname: '温柔守护者', avatarUrl: '', mbtiType: 'ISFJ', mbtiGroup: 'SJ' },
    title: '给ISFJ的一封信：你的付出值得被看见',
    content: '亲爱的ISFJ们：\n\n我知道你总是那个默默付出的人。记住每个人的生日，在朋友难过时第一个发消息关心，把家里打理得井井有条，在工作中承担了最多却从不邀功。\n\nSi让我们重视传统和稳定，Fe让我们总想让身边的人开心。这是美好的品质，但也容易让我们忽略自己的需求。\n\n今天想对你说：\n\n💝 你不需要通过照顾别人来证明自己的价值\n💝 说"不"不代表你不善良\n💝 你的感受和需求同样重要\n💝 偶尔让别人来照顾你，也是可以的\n\n世界需要ISFJ，但ISFJ也需要好好爱自己。\n\n今天，请为自己做一件小小的开心事吧 🌸',
    images: [],
    tags: ['ISFJ', 'Si', 'Fe', '自我关怀'],
    topic: 'growth',
    likes: 534,
    comments: 89,
    isLiked: false,
    isFavorited: false,
    createTime: '2026-04-12T08:30:00',
    isSample: true
  }
]

// ====== 笔记管理函数 ======

const NOTES_STORAGE_KEY = 'mbti_notes'
const LIKED_NOTES_KEY = 'mbti_liked_notes'
const FAVORITED_NOTES_KEY = 'mbti_favorited_notes'

// 获取所有笔记（示例 + 用户发布的）
function getAllNotes() {
  try {
    const userNotes = wx.getStorageSync(NOTES_STORAGE_KEY) || []
    return [...userNotes, ...SAMPLE_NOTES]
  } catch (e) {
    return [...SAMPLE_NOTES]
  }
}

// 获取笔记列表（支持筛选和分页）
function getNotes(options = {}) {
  const { topic, mbtiType, mbtiGroup, page = 1, pageSize = 10 } = options
  let notes = getAllNotes()

  // 按话题筛选
  if (topic && topic !== 'all') {
    if (topic === 'moment') {
      notes = notes.filter((n) => n.noteKind === 'micro' || n.topic === 'moment')
    } else if (topic === 'featured') {
      notes = SAMPLE_NOTES.slice().sort((a, b) => (b.likes || 0) - (a.likes || 0))
    } else {
      notes = notes.filter((n) => n.topic === topic && n.noteKind !== 'micro')
    }
  } else {
    notes = notes.filter((n) => n.noteKind !== 'micro')
  }

  // 按MBTI类型筛选
  if (mbtiType) {
    notes = notes.filter(n => n.author.mbtiType === mbtiType)
  }

  // 按族群筛选
  if (mbtiGroup) {
    notes = notes.filter(n => n.author.mbtiGroup === mbtiGroup)
  }

  // 排序：最新优先
  notes.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))

  // 分页
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = notes.slice(start, end)

  // 恢复点赞/收藏状态
  const likedNotes = getLikedNotes()
  const favoritedNotes = getFavoritedNotes()
  list.forEach(note => {
    note.isLiked = likedNotes.includes(note.id)
    note.isFavorited = favoritedNotes.includes(note.id)
  })

  return {
    list,
    total: notes.length,
    hasMore: end < notes.length,
    page,
    pageSize
  }
}

// 获取单篇笔记
function getNoteById(id) {
  const notes = getAllNotes()
  const note = notes.find(n => n.id === id)
  if (note) {
    const likedNotes = getLikedNotes()
    const favoritedNotes = getFavoritedNotes()
    note.isLiked = likedNotes.includes(note.id)
    note.isFavorited = favoritedNotes.includes(note.id)
  }
  return note || null
}

const MICRO_MAX_LENGTH = 80

function buildMicroRecordTemplate(matchContext) {
  const {
    myType = '',
    friendType = '',
    friendNickname = '',
    relationName = '',
    relationEmoji = ''
  } = matchContext || {}
  const name = friendNickname || friendType || 'TA'
  const rel = relationEmoji ? `${relationEmoji} ${relationName}` : relationName
  return `和 ${name} 测出来是「${rel}」关系，我觉得`
}

function publishMicroRecord({ author, content, matchContext }) {
  const text = (content || '').trim()
  if (!text) return null

  const id = 'moment_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4)
  const ctx = matchContext || {}
  const note = {
    id,
    author,
    title: '',
    content: text.slice(0, MICRO_MAX_LENGTH),
    images: [],
    tags: [ctx.myType, ctx.friendType, ctx.relationName].filter(Boolean),
    topic: 'moment',
    noteKind: 'micro',
    matchContext: ctx,
    likes: 0,
    comments: 0,
    isLiked: false,
    isFavorited: false,
    createTime: new Date().toISOString(),
    isSample: false
  }

  try {
    const userNotes = wx.getStorageSync(NOTES_STORAGE_KEY) || []
    userNotes.unshift(note)
    if (userNotes.length > 200) userNotes.length = 200
    wx.setStorageSync(NOTES_STORAGE_KEY, userNotes)
  } catch (e) {
    console.warn('保存关系瞬间失败', e)
    return null
  }

  return note
}

function getMicroRecords() {
  try {
    const userNotes = wx.getStorageSync(NOTES_STORAGE_KEY) || []
    return userNotes.filter((n) => n.noteKind === 'micro' || n.topic === 'moment')
  } catch (e) {
    return []
  }
}

// 发布笔记
function publishNote(noteData) {
  const id = 'note_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4)
  const note = {
    id,
    author: noteData.author,
    title: noteData.title || '',
    content: noteData.content,
    images: noteData.images || [],
    tags: noteData.tags || [],
    topic: noteData.topic || 'daily',
    likes: 0,
    comments: 0,
    isLiked: false,
    isFavorited: false,
    createTime: new Date().toISOString(),
    isSample: false
  }

  try {
    const userNotes = wx.getStorageSync(NOTES_STORAGE_KEY) || []
    userNotes.unshift(note)
    // 最多保存200篇用户笔记
    if (userNotes.length > 200) userNotes.length = 200
    wx.setStorageSync(NOTES_STORAGE_KEY, userNotes)
  } catch (e) {
    console.warn('保存笔记失败', e)
  }

  return note
}

// 删除笔记
function deleteNote(id) {
  try {
    const userNotes = wx.getStorageSync(NOTES_STORAGE_KEY) || []
    const idx = userNotes.findIndex(n => n.id === id)
    if (idx >= 0) {
      userNotes.splice(idx, 1)
      wx.setStorageSync(NOTES_STORAGE_KEY, userNotes)
      return true
    }
  } catch (e) {
    console.warn('删除笔记失败', e)
  }
  return false
}

// 获取我的笔记
function getMyNotes() {
  try {
    return wx.getStorageSync(NOTES_STORAGE_KEY) || []
  } catch (e) {
    return []
  }
}

// ====== 点赞/收藏 ======

function getLikedNotes() {
  try {
    return wx.getStorageSync(LIKED_NOTES_KEY) || []
  } catch (e) {
    return []
  }
}

function getFavoritedNotes() {
  try {
    return wx.getStorageSync(FAVORITED_NOTES_KEY) || []
  } catch (e) {
    return []
  }
}

function toggleLike(noteId) {
  const liked = getLikedNotes()
  const idx = liked.indexOf(noteId)
  let isLiked
  if (idx >= 0) {
    liked.splice(idx, 1)
    isLiked = false
    // 更新笔记的 likes 数
    _updateNoteLikes(noteId, -1)
  } else {
    liked.push(noteId)
    isLiked = true
    _updateNoteLikes(noteId, 1)
  }
  try {
    wx.setStorageSync(LIKED_NOTES_KEY, liked)
  } catch (e) {}
  return isLiked
}

function toggleFavorite(noteId) {
  const fav = getFavoritedNotes()
  const idx = fav.indexOf(noteId)
  let isFavorited
  if (idx >= 0) {
    fav.splice(idx, 1)
    isFavorited = false
  } else {
    fav.push(noteId)
    isFavorited = true
  }
  try {
    wx.setStorageSync(FAVORITED_NOTES_KEY, fav)
  } catch (e) {}
  return isFavorited
}

function _updateNoteLikes(noteId, delta) {
  try {
    const userNotes = wx.getStorageSync(NOTES_STORAGE_KEY) || []
    const note = userNotes.find(n => n.id === noteId)
    if (note) {
      note.likes = Math.max(0, (note.likes || 0) + delta)
      wx.setStorageSync(NOTES_STORAGE_KEY, userNotes)
    }
  } catch (e) {}
}

// ====== 内容安全检查 ======

const cloudService = require('./cloudService')

function _localContentCheck(text) {
  if (!text || typeof text !== 'string') return { safe: true }
  const basicFilter = /赌博|色情|暴力|毒品/
  if (basicFilter.test(text)) {
    return { safe: false, reason: '内容包含违规词汇，请修改后重试' }
  }
  return { safe: true }
}

function checkContentSafety(text) {
  const local = _localContentCheck(text)
  if (!local.safe) return Promise.resolve(local)
  if (!text || typeof text !== 'string') return Promise.resolve({ safe: true })
  return cloudService.checkTextSecurity(text).then((cloud) => {
    if (cloud.offline) return local
    return cloud
  })
}

// ====== 工具函数 ======

function formatTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
  
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

function getGroupInfo(mbtiType) {
  const typeInfo = MBTI_TYPES[mbtiType]
  if (!typeInfo) return null
  return MBTI_GROUPS[typeInfo.group] || null
}

module.exports = {
  TOPICS,
  TOPIC_LIST,
  SAMPLE_NOTES,
  MICRO_MAX_LENGTH,
  getAllNotes,
  getNotes,
  getNoteById,
  publishNote,
  publishMicroRecord,
  buildMicroRecordTemplate,
  getMicroRecords,
  deleteNote,
  getMyNotes,
  toggleLike,
  toggleFavorite,
  getLikedNotes,
  getFavoritedNotes,
  checkContentSafety,
  formatTime,
  getGroupInfo
}
