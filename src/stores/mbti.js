import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { MBTI_TYPES, COGNITIVE_FUNCTION_DESCRIPTIONS, RELATIONSHIP_DESCRIPTIONS, FUNCTION_POSITION_ANALYSIS } from '@/data/constants'
import { getMbtiRelation } from '@/utils/mbtiRelations'

export const useMbtiStore = defineStore('mbti', () => {
  // 用户自己的类型
  const myType = ref(localStorage.getItem('mbti_my_type') || '')
  
  // 测试页面的两个人格
  const personality1 = ref({ E: false, N: false, F: false, J: false })
  const personality2 = ref({ E: false, N: false, F: false, J: false })

  // 邀请匹配相关
  const inviteCode = ref('')
  const inviterType = ref('')

  // 计算 MBTI 类型字符串
  const getTypeFromPersonality = (p) => {
    return (p.E ? 'E' : 'I') + (p.N ? 'N' : 'S') + (p.F ? 'F' : 'T') + (p.J ? 'J' : 'P')
  }

  const setPersonalityFromType = (typeStr) => {
    return {
      E: typeStr[0] === 'E',
      N: typeStr[1] === 'N',
      F: typeStr[2] === 'F',
      J: typeStr[3] === 'J'
    }
  }

  const type1 = computed(() => getTypeFromPersonality(personality1.value))
  const type2 = computed(() => getTypeFromPersonality(personality2.value))

  // 获取类型信息
  const getTypeInfo = (type) => MBTI_TYPES[type] || null

  // 获取认知功能列表
  const getCognitiveFunctions = (type, count = 8) => {
    const info = MBTI_TYPES[type]
    if (!info) return []
    return info.functions.slice(0, count).map((code, index) => ({
      code,
      name: COGNITIVE_FUNCTION_DESCRIPTIONS[code]?.name || code,
      description: COGNITIVE_FUNCTION_DESCRIPTIONS[code]?.description || '',
      position: index,
      positionName: ['主导', '辅助', '第三', '劣势', '对立', '批判', '欺骗', '魔鬼'][index],
      positionEnglish: ['Hero', 'Parent', 'Child', 'Inferior', 'Nemesis', 'Critic', 'Trickster', 'Demon'][index]
    }))
  }

  // 获取关系分析
  const getRelationship = (t1, t2) => {
    const forward = getMbtiRelation(t1, t2)
    const backward = getMbtiRelation(t2, t1)
    const isSymmetric = forward === backward
    return {
      forward,
      backward,
      isSymmetric,
      displayType: isSymmetric ? forward : `${forward} / ${backward}`,
      forwardDesc: RELATIONSHIP_DESCRIPTIONS[forward] || '',
      backwardDesc: RELATIONSHIP_DESCRIPTIONS[backward] || ''
    }
  }

  // 获取八维碰撞分析
  const getCognitiveFunctionCollision = (t1, t2) => {
    const f1 = MBTI_TYPES[t1]?.functions || []
    const f2 = MBTI_TYPES[t2]?.functions || []
    
    const collisions = []
    for (let i = 0; i < Math.min(4, f1.length, f2.length); i++) {
      const func1 = f1[i]
      const func2 = f2[i]
      const posName = ['主导', '辅助', '第三', '劣势'][i]
      
      let relation = ''
      if (func1 === func2) {
        relation = '共鸣'
      } else if (func1[1] === func2[1] && func1[0] !== func2[0]) {
        relation = '互补'
      } else if (func1[0] === func2[0] && func1[1] !== func2[1]) {
        relation = '碰撞'
      } else {
        relation = '交织'
      }
      
      collisions.push({
        position: posName,
        func1: { code: func1, name: COGNITIVE_FUNCTION_DESCRIPTIONS[func1]?.name || func1 },
        func2: { code: func2, name: COGNITIVE_FUNCTION_DESCRIPTIONS[func2]?.name || func2 },
        relation,
        isSame: func1 === func2,
        samePosition: f2.slice(0, 4).indexOf(func1) === i
      })
    }
    return collisions
  }

  // 保存我的类型
  const saveMyType = (type) => {
    myType.value = type
    localStorage.setItem('mbti_my_type', type)
  }

  // 生成邀请码
  const generateInviteCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    inviteCode.value = code
    inviterType.value = myType.value
    // 存储到 localStorage 模拟后端
    const invites = JSON.parse(localStorage.getItem('mbti_invites') || '{}')
    invites[code] = { type: myType.value, createdAt: Date.now() }
    localStorage.setItem('mbti_invites', JSON.stringify(invites))
    return code
  }

  // 获取邀请信息
  const getInviteInfo = (code) => {
    const invites = JSON.parse(localStorage.getItem('mbti_invites') || '{}')
    return invites[code] || null
  }

  return {
    myType,
    personality1,
    personality2,
    type1,
    type2,
    inviteCode,
    inviterType,
    getTypeFromPersonality,
    setPersonalityFromType,
    getTypeInfo,
    getCognitiveFunctions,
    getRelationship,
    getCognitiveFunctionCollision,
    saveMyType,
    generateInviteCode,
    getInviteInfo
  }
})
