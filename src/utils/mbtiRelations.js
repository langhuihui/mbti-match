import { MBTI_TYPE_ORDER } from '../constants.js';

/**
 * 判断两个 MBTI 类型之间的关系
 * @param {string} type1 第一个 MBTI 类型
 * @param {string} type2 第二个 MBTI 类型
 * @returns {string} 关系类型
 */
export function getMbtiRelation(type1, type2) {
  // 验证输入
  if (!type1 || !type2 || type1.length !== 4 || type2.length !== 4) {
    throw new Error('Invalid MBTI type');
  }

  // 计算相同和不同的位置
  const same = [];
  const diff = [];
  for (let i = 0; i < 4; i++) {
    if (type1[i] === type2[i]) {
      same.push(i);
    } else {
      diff.push(i);
    }
  }

  // 规则1：字母全同则是本体关系
  if (same.length === 4) {
    return '本体';
  }

  // 规则2：前三个字母相同则是衬托关系
  if (same.length === 3 && !same.includes(3)) {
    return '衬托';
  }

  // 规则3：字母都不同则是全反关系
  if (same.length === 0) {
    return '全反';
  }

  // 规则4：仅第四个字母相同则是新奇关系
  if (same.length === 1 && same[0] === 3) {
    return '新奇';
  }

  // 规则5：仅第三个字母不同或仅第二个字母不同
  if (same.length === 3) {
    if (!same.includes(2)) {
      return type1[3] === 'P' ? '陪伴' : '邻居';
    }
    if (!same.includes(1)) {
      return type1[3] === 'J' ? '陪伴' : '邻居';
    }
  }

  // 规则6：中间两个字母相同的情况
  if (same.includes(1) && same.includes(2)) {
    // 仅中间两个字母相同
    if (same.length === 2) {
      return type1[3] === 'P' ? '伙伴' : '对比';
    }
    // 仅第一个字母不同
    if (!same.includes(0) && same.includes(3)) {
      return '伙伴';
    }
  }

  // 规则7：前两个字母相同
  if (same.includes(0) && same.includes(1)) {
    return '顾问';
  }

  // 规则8：第二和第四个字母相同
  if (same.includes(1) && same.includes(3)) {
    return type1[3] === 'P' ? '同族' : '对手';
  }

  // 新增规则：第三和第四个字母相同
  if (same.includes(2) && same.includes(3)) {
    return type1[3] === 'J' ? '同族' : '对手';
  }

  // 规则9：第一和第四个字母相同
  if (same.includes(0) && same.includes(3)) {
    return '陌生';
  }

  // 规则10：第一和第三个字母相同
  if (same.includes(0) && same.includes(2)) {
    return '室友';
  }

  // 规则11：仅第一个字母相同
  if (same.length === 1 && same[0] === 0) {
    return '互补';
  }

  // 规则12：仅第二个字母相同或仅第三个字母相同
  if (same.length === 1 && (same[0] === 1 || same[0] === 2)) {
    return type1[3] === 'J' ? '老师' : '支持';
  }

  // 如果还是没有匹配的规则，返回未知
  return '未知';
}

/**
 * 验证两个类型之间的关系是否正确
 * @param {string} type1 第一个 MBTI 类型
 * @param {string} type2 第二个 MBTI 类型
 * @param {string} expectedRelation 期望的关系
 * @returns {boolean} 是否匹配
 */
export function validateRelation(type1, type2, expectedRelation) {
  const actualRelation = getMbtiRelation(type1, type2);
  return actualRelation === expectedRelation;
}

/**
 * 生成完整的关系矩阵
 * @returns {Object} 关系矩阵
 */
export function generateRelationMatrix() {
  const matrix = {};
  for (const type1 of MBTI_TYPE_ORDER) {
    matrix[type1] = {};
    for (const type2 of MBTI_TYPE_ORDER) {
      matrix[type1][type2] = getMbtiRelation(type1, type2);
    }
  }
  return matrix;
}

// 示例用法：
// const relation = getMbtiRelation('INFP', 'ENTJ') // 返回 "老师"
// const isValid = validateRelation('INFP', 'ENTJ', '老师') // 返回 true
// const matrix = generateRelationMatrix() // 生成完整的关系矩阵 