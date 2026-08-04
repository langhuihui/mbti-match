/**
 * 关系图谱数据构建
 */
const { MBTI_TYPES, MBTI_GROUPS, RELATIONSHIP_TYPES } = require('./constants')
const { getMbtiRelation } = require('./mbtiRelations')

const RADIUS = 38

function _position(index, total) {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2
  const x = 50 + RADIUS * Math.cos(angle)
  const y = 50 + RADIUS * Math.sin(angle)
  const lineAngle = Math.atan2(y - 50, x - 50) * (180 / Math.PI)
  const lineLength = Math.sqrt(Math.pow(x - 50, 2) + Math.pow(y - 50, 2))
  return { x, y, lineAngle, lineLength }
}

function _buildNode(friend, myType, index, total) {
  const pos = _position(index, total)
  const relationKey = getMbtiRelation(myType, friend.mbtiType)
  const relation = RELATIONSHIP_TYPES[relationKey] || {}
  const typeInfo = MBTI_TYPES[friend.mbtiType] || {}
  const groupInfo = typeInfo.group ? MBTI_GROUPS[typeInfo.group] : null

  return {
    id: friend.id || `${friend.mbtiType}_${index}`,
    nickname: friend.nickname || friend.mbtiType,
    avatarUrl: friend.avatarUrl || typeInfo.image || '',
    mbtiType: friend.mbtiType,
    typeName: typeInfo.name || '',
    groupColor: groupInfo ? groupInfo.color : '#6366f1',
    relationKey,
    relationName: relation.name || relationKey,
    relationEmoji: relation.emoji || '?',
    relationColor: relation.color || '#6366f1',
    relationLevel: relation.level || 3,
    ...pos
  }
}

/**
 * 从好友列表构建星图节点（好友优先）
 */
function buildFromFriends(myType, friends) {
  if (!myType || !friends || !friends.length) {
    return { nodes: [], total: 0 }
  }
  const nodes = friends
    .filter((f) => f.mbtiType)
    .map((f, i, arr) => _buildNode(f, myType, i, arr.length))
  return { nodes, total: nodes.length }
}

/**
 * 从匹配记录补充（无好友信息时）
 */
function buildFromMatchHistory(myType, matchHistory, userInfo) {
  if (!myType || !matchHistory || !matchHistory.length) {
    return { nodes: [], total: 0 }
  }

  const seen = new Set()
  const unique = []
  matchHistory.forEach((record) => {
    const key = `${record.friendType}_${record.friendNickname || ''}`
    if (seen.has(key)) return
    seen.add(key)
    unique.push({
      id: key,
      nickname: record.friendNickname || record.friendType,
      avatarUrl: record.friendAvatar || '',
      mbtiType: record.friendType
    })
  })

  const nodes = unique.map((f, i, arr) => _buildNode(f, myType, i, arr.length))
  return { nodes, total: nodes.length }
}

/**
 * 关系统计摘要
 */
function buildStats(nodes) {
  const stats = { total: nodes.length, byRelation: {}, avgLevel: 0 }
  if (!nodes.length) return stats

  let levelSum = 0
  nodes.forEach((n) => {
    stats.byRelation[n.relationName] = (stats.byRelation[n.relationName] || 0) + 1
    levelSum += n.relationLevel
  })
  stats.avgLevel = Math.round((levelSum / nodes.length) * 10) / 10

  const topRelation = Object.entries(stats.byRelation)
    .sort((a, b) => b[1] - a[1])[0]
  stats.topRelation = topRelation ? topRelation[0] : ''

  return stats
}

module.exports = {
  buildFromFriends,
  buildFromMatchHistory,
  buildStats
}
