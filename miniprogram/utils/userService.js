/**
 * 用户数据服务层（数据层抽象）
 *
 * 所有读写用户、MBTI、好友、匹配记录的操作都必须经过本模块，
 * 不应该在页面代码里直接调用 wx.getStorageSync('friends') 等原始接口。
 *
 * 当前后端：wx.storage（同步）
 * 未来可无缝替换为：云开发 / 自建 REST（只需改本文件 _adapter）
 *
 * 设计原则：
 * 1. 所有对外方法返回 Promise（即便本地实现是同步的，也包一层 Promise），
 *    为将来切到云端（异步）做准备。
 * 2. 所有写操作触发 emit(event)，页面通过 subscribe 监听数据变化。
 * 3. 不直接修改 app.globalData，而是在 _syncToGlobalData 中写回，
 *    保持 globalData 作为只读镜像。
 */

// ========== 存储 key 约定 ==========
const K_USER_INFO = 'userInfo'
const K_MY_MBTI = 'myMBTI'
const K_FRIENDS = 'friends'
const K_MATCH_HISTORY = 'matchHistory'
const K_PRIVACY = 'privacyAccepted'

// ========== 常量 ==========
const MAX_FRIENDS = 100
const MAX_MATCH_RECORDS = 50
const PRIVACY_VERSION = '1.0.0'

// ========== 存储适配器（可替换） ==========
const storageAdapter = {
  get(key) {
    try {
      return wx.getStorageSync(key)
    } catch (e) {
      console.warn('storage get failed', key, e)
      return null
    }
  },
  set(key, value) {
    try {
      wx.setStorageSync(key, value)
      return true
    } catch (e) {
      console.warn('storage set failed', key, e)
      return false
    }
  },
  remove(key) {
    try {
      wx.removeStorageSync(key)
      return true
    } catch (e) {
      console.warn('storage remove failed', key, e)
      return false
    }
  }
}

// ========== 事件总线 ==========
const listeners = new Map() // event -> Set<fn>

function emit(event, payload) {
  const set = listeners.get(event)
  if (!set) return
  set.forEach((fn) => {
    try { fn(payload) } catch (e) { console.warn('listener error', e) }
  })
}

function subscribe(event, fn) {
  if (!listeners.has(event)) listeners.set(event, new Set())
  listeners.get(event).add(fn)
  return () => unsubscribe(event, fn)
}

function unsubscribe(event, fn) {
  const set = listeners.get(event)
  if (set) set.delete(fn)
}

// ========== 默认用户信息生成 ==========
const AVATAR_LIST = [
  '/images/avatars/intj-architect.svg',
  '/images/avatars/intp-logician.svg',
  '/images/avatars/entj-commander.svg',
  '/images/avatars/entp-debater.svg',
  '/images/avatars/infj-advocate.svg',
  '/images/avatars/infp-mediator.svg',
  '/images/avatars/enfj-protagonist.svg',
  '/images/avatars/enfp-campaigner.svg',
  '/images/avatars/istj-logistician.svg',
  '/images/avatars/isfj-defender.svg',
  '/images/avatars/estj-executive.svg',
  '/images/avatars/esfj-consul.svg',
  '/images/avatars/istp-virtuoso.svg',
  '/images/avatars/isfp-adventurer.svg',
  '/images/avatars/estp-entrepreneur.svg',
  '/images/avatars/esfp-entertainer.svg'
]

const NICKNAME_PREFIXES = ['星空', '月光', '晨风', '云端', '深海', '极光', '银河', '微光', '暮色', '朝露', '晚霞', '星辰', '雨后', '清风', '山雾', '花间']
const NICKNAME_SUFFIXES = ['探索者', '旅行家', '思考者', '观察者', '梦想家', '冒险者', '守护者', '创造者', '漫步者', '拾光者', '追梦人', '织梦者', '流浪者', '收藏家', '点灯人', '寻路人']

function generateDefaultUserInfo() {
  return {
    avatarUrl: AVATAR_LIST[Math.floor(Math.random() * AVATAR_LIST.length)],
    nickname: NICKNAME_PREFIXES[Math.floor(Math.random() * NICKNAME_PREFIXES.length)] +
              NICKNAME_SUFFIXES[Math.floor(Math.random() * NICKNAME_SUFFIXES.length)],
    isDefault: true,
    updateTime: new Date().toISOString()
  }
}

// ========== 运行时缓存（减少重复 IO，同时作为 globalData 的来源） ==========
const state = {
  userInfo: null,
  hasUserInfo: false,
  myType: '',
  friends: [],
  matchHistory: [],
  privacyAccepted: false,
  loaded: false
}

/**
 * 启动时加载全部数据，返回初始 state 快照
 * 若从未使用过（没有 userInfo），自动创建默认用户信息。
 */
function load() {
  if (state.loaded) return Promise.resolve(getSnapshot())

  // userInfo
  let userInfo = storageAdapter.get(K_USER_INFO)
  if (!userInfo) {
    userInfo = generateDefaultUserInfo()
    storageAdapter.set(K_USER_INFO, userInfo)
  }
  state.userInfo = userInfo
  state.hasUserInfo = true

  state.myType = storageAdapter.get(K_MY_MBTI) || ''
  state.friends = storageAdapter.get(K_FRIENDS) || []
  state.matchHistory = storageAdapter.get(K_MATCH_HISTORY) || []

  const privacy = storageAdapter.get(K_PRIVACY)
  state.privacyAccepted = !!(privacy && privacy.version === PRIVACY_VERSION)

  state.loaded = true
  return Promise.resolve(getSnapshot())
}

function getSnapshot() {
  return {
    userInfo: state.userInfo,
    hasUserInfo: state.hasUserInfo,
    myType: state.myType,
    friends: state.friends.slice(),
    matchHistory: state.matchHistory.slice(),
    privacyAccepted: state.privacyAccepted
  }
}

// ========== 用户信息 ==========
function saveUserInfo(userInfo) {
  if (!userInfo) return Promise.reject(new Error('empty userInfo'))
  const merged = { ...userInfo, isDefault: false, updateTime: new Date().toISOString() }
  state.userInfo = merged
  state.hasUserInfo = true
  storageAdapter.set(K_USER_INFO, merged)
  emit('userInfo:change', merged)
  return Promise.resolve(merged)
}

function getUserInfo() {
  return Promise.resolve(state.userInfo)
}

// ========== MBTI ==========
function saveMyMBTI(type) {
  if (!type) return Promise.reject(new Error('empty type'))
  state.myType = type
  storageAdapter.set(K_MY_MBTI, type)
  emit('mbti:change', type)
  return Promise.resolve(type)
}

function getMyMBTI() {
  return Promise.resolve(state.myType)
}

// ========== 好友 ==========
function listFriends() {
  return Promise.resolve(state.friends.slice())
}

function addFriend(friendInfo) {
  if (!friendInfo || !friendInfo.id) return Promise.reject(new Error('invalid friend'))
  const list = state.friends.slice()
  const existingIdx = list.findIndex((f) => f.id === friendInfo.id)
  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], ...friendInfo }
  } else {
    list.unshift(friendInfo)
  }
  if (list.length > MAX_FRIENDS) list.length = MAX_FRIENDS
  state.friends = list
  storageAdapter.set(K_FRIENDS, list)
  emit('friends:change', list.slice())
  return Promise.resolve(list.slice())
}

function removeFriend(id) {
  const list = state.friends.filter((f) => f.id !== id)
  state.friends = list
  storageAdapter.set(K_FRIENDS, list)
  emit('friends:change', list.slice())
  return Promise.resolve(list.slice())
}

function clearFriends() {
  state.friends = []
  storageAdapter.remove(K_FRIENDS)
  emit('friends:change', [])
  return Promise.resolve()
}

// ========== 匹配记录 ==========
function listMatchHistory() {
  return Promise.resolve(state.matchHistory.slice())
}

function addMatchRecord(record) {
  if (!record) return Promise.reject(new Error('invalid record'))
  const item = {
    ...record,
    date: record.date || new Date().toISOString()
  }
  const list = [item, ...state.matchHistory]
  if (list.length > MAX_MATCH_RECORDS) list.length = MAX_MATCH_RECORDS
  state.matchHistory = list
  storageAdapter.set(K_MATCH_HISTORY, list)
  emit('match:change', list.slice())
  return Promise.resolve(list.slice())
}

function clearMatchHistory() {
  state.matchHistory = []
  storageAdapter.remove(K_MATCH_HISTORY)
  emit('match:change', [])
  return Promise.resolve()
}

// ========== 清空所有数据 ==========
function clearAll() {
  state.friends = []
  state.matchHistory = []
  storageAdapter.remove(K_FRIENDS)
  storageAdapter.remove(K_MATCH_HISTORY)
  emit('friends:change', [])
  emit('match:change', [])
  return Promise.resolve()
}

// ========== 隐私 ==========
function isPrivacyAccepted() {
  return state.privacyAccepted
}

function acceptPrivacy() {
  state.privacyAccepted = true
  storageAdapter.set(K_PRIVACY, {
    version: PRIVACY_VERSION,
    acceptTime: new Date().toISOString()
  })
  emit('privacy:change', true)
  return Promise.resolve(true)
}

// ========== 导出 ==========
module.exports = {
  // 版本 & 常量
  PRIVACY_VERSION,
  MAX_FRIENDS,
  MAX_MATCH_RECORDS,
  AVATAR_LIST,
  NICKNAME_PREFIXES,
  NICKNAME_SUFFIXES,

  // 生命周期
  load,
  getSnapshot,

  // 用户
  getUserInfo,
  saveUserInfo,

  // MBTI
  getMyMBTI,
  saveMyMBTI,

  // 好友
  listFriends,
  addFriend,
  removeFriend,
  clearFriends,

  // 匹配记录
  listMatchHistory,
  addMatchRecord,
  clearMatchHistory,

  // 总清空
  clearAll,

  // 隐私
  isPrivacyAccepted,
  acceptPrivacy,

  // 事件
  subscribe,
  unsubscribe
}
