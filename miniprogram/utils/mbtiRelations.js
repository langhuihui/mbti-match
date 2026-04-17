const { MBTI_TYPE_ORDER } = require('./constants')

/**
 * 判断两个 MBTI 类型之间的关系
 * @param {string} type1 第一个 MBTI 类型
 * @param {string} type2 第二个 MBTI 类型
 * @returns {string} 关系类型
 */
function getMbtiRelation(type1, type2) {
  if (!type1 || !type2 || type1.length !== 4 || type2.length !== 4) {
    return '未知'
  }

  const same = []
  const diff = []
  for (let i = 0; i < 4; i++) {
    if (type1[i] === type2[i]) {
      same.push(i)
    } else {
      diff.push(i)
    }
  }

  if (same.length === 4) return '本体'
  if (same.length === 3 && !same.includes(3)) return '衬托'
  if (same.length === 0) return '全反'
  if (same.length === 1 && same[0] === 3) return '新奇'

  if (same.length === 3) {
    if (!same.includes(2)) return type1[3] === 'P' ? '陪伴' : '邻居'
    if (!same.includes(1)) return type1[3] === 'J' ? '陪伴' : '邻居'
  }

  if (same.includes(1) && same.includes(2)) {
    if (same.length === 2) return type1[3] === 'P' ? '伙伴' : '对比'
    if (!same.includes(0) && same.includes(3)) return '伙伴'
  }

  if (same.includes(0) && same.includes(1)) return '顾问'
  if (same.includes(1) && same.includes(3)) return type1[3] === 'P' ? '同族' : '对手'
  if (same.includes(2) && same.includes(3)) return type1[3] === 'J' ? '同族' : '对手'
  if (same.includes(0) && same.includes(3)) return '陌生'
  if (same.includes(0) && same.includes(2)) return '室友'
  if (same.length === 1 && same[0] === 0) return '互补'
  if (same.length === 1 && (same[0] === 1 || same[0] === 2)) {
    return type1[3] === 'J' ? '老师' : '支持'
  }

  return '未知'
}

module.exports = {
  getMbtiRelation
}
