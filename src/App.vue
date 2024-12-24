<template>
  <n-config-provider>
    <n-message-provider>
      <div class="container">
        <!-- 关系描述放在顶部 -->
        <div v-if="type1 && type2" class="relationship-header">
          <n-text class="relationship-detail">{{ relationshipDetail }}</n-text>
        </div>

        <div class="personalities-container">
          <personality-card
            class="personality-card"
            title="第一个人格"
            :personality="personality1"
            :type="type1"
            :cognitive-functions="cognitiveFunctions1List"
            :other-type="type2"
            @update:personality="(val, key) => personality1[key] = val"
            @open-function-description="openFunctionDescription"
          />

          <!-- 关系标题悬浮在中间 -->
          <div v-if="type1 && type2" class="relationship-floating">
            <div class="connection-line left"></div>
            <div class="relationship-title" :class="[relationshipCode.forward.toLowerCase(), { 'dual-relationship': relationshipCode.forward !== relationshipCode.backward }]">
              {{ relationshipType }}
            </div>
            <div class="connection-line right"></div>
          </div>

          <personality-card
            class="personality-card"
            title="第二个人格"
            :personality="personality2"
            :type="type2"
            :cognitive-functions="cognitiveFunctions2List"
            :other-type="type1"
            @update:personality="(val, key) => personality2[key] = val"
            @open-function-description="openFunctionDescription"
          />
        </div>

        <n-text v-if="hasHighlightedFunctions" class="highlight-note">
          <n-icon><information-circle /></n-icon>
          高亮显示的认知功能表示两个人格之间的共同或互补功能
        </n-text>

        <!-- 认知功能说明对话框 -->
        <n-modal
          v-model:show="showFunctionModal"
          preset="card"
          style="max-width: 600px"
          title="认知功能说明"
        >
          <template v-if="selectedFunction">
            <div class="function-modal-content">
              <n-text strong class="function-modal-code">
                {{ selectedFunction.code }}
              </n-text>
              <n-text class="function-modal-desc">
                {{ selectedFunction.desc }}
              </n-text>
            </div>
          </template>
        </n-modal>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  NConfigProvider,
  NMessageProvider,
  NCard,
  NText,
  NH1,
  NIcon,
  NModal
} from 'naive-ui'
import { InformationCircle } from '@vicons/ionicons5'
import PersonalityCard from './components/PersonalityCard.vue'
import { 
  MBTI_TYPES,
  COGNITIVE_FUNCTION_DESCRIPTIONS,
  FUNCTION_POSITION_ANALYSIS,
  RELATIONSHIP_DESCRIPTIONS
} from './constants'
import { getMbtiRelation } from './utils/mbtiRelations'

const personality1 = ref({
  E: false,
  N: false,
  F: false,
  J: false
})

const personality2 = ref({
  E: false,
  N: false,
  F: false,
  J: false
})

const getPersonalityType = (personality) => {
  return (personality.E ? 'E' : 'I') +
         (personality.N ? 'N' : 'S') +
         (personality.F ? 'F' : 'T') +
         (personality.J ? 'J' : 'P')
}

const type1 = computed(() => getPersonalityType(personality1.value))
const type2 = computed(() => getPersonalityType(personality2.value))

const cognitiveFunctions1List = computed(() => {
  const type = MBTI_TYPES[type1.value]
  if (!type) return []
  return type.functions.slice(0, 4).map((code, index) => ({
    code,
    desc: COGNITIVE_FUNCTION_DESCRIPTIONS[code].name,
    fullDesc: COGNITIVE_FUNCTION_DESCRIPTIONS[code].description,
    isInferior: index === 3
  }))
})

const cognitiveFunctions2List = computed(() => {
  const type = MBTI_TYPES[type2.value]
  if (!type) return []
  return type.functions.slice(0, 4).map((code, index) => ({
    code,
    desc: COGNITIVE_FUNCTION_DESCRIPTIONS[code].name,
    fullDesc: COGNITIVE_FUNCTION_DESCRIPTIONS[code].description,
    isInferior: index === 3
  }))
})

const hasHighlightedFunctions = computed(() => {
  return type1.value && type2.value
})

const isHighlighted = (functionCode, currentType, otherType) => {
  if (!currentType || !otherType) return false
  
  const currentFunctions = MBTI_TYPES[currentType].functions
  const otherFunctions = MBTI_TYPES[otherType].functions
  
  // 检查是否是相同的功能
  const currentIndex = currentFunctions.indexOf(functionCode)
  const otherIndex = otherFunctions.indexOf(functionCode)
  
  // 如果两个类型都有这个功能，且位置相近（±1），则高亮
  if (currentIndex !== -1 && otherIndex !== -1) {
    return Math.abs(currentIndex - otherIndex) <= 1
  }
  
  return false
}

const relationshipCode = computed(() => {
  if (!type1.value || !type2.value) return { forward: '', backward: '' }
  const forward = getMbtiRelation(type1.value, type2.value)
  const backward = getMbtiRelation(type2.value, type1.value)
  return { forward, backward }
})

const relationshipType = computed(() => {
  if (!type1.value || !type2.value) return ''
  const { forward, backward } = relationshipCode.value
  
  if (forward === backward) {
    return forward
  }
  return `${forward} / ${backward}`
})

// 修改关系分析的计算属性
const relationshipDetail = computed(() => {
  if (!type1.value || !type2.value) return ''
  
  const { forward, backward } = relationshipCode.value
  
  let analysis = ''
  
  // 添加关系类型描述
  if (forward === backward) {
    analysis = `${forward}关系：${RELATIONSHIP_DESCRIPTIONS[forward]}\n\n`
  } else {
    analysis = `${type1.value}对${type2.value}：${forward}关系 - ${RELATIONSHIP_DESCRIPTIONS[forward]}\n`
    analysis += `${type2.value}对${type1.value}：${backward}关系 - ${RELATIONSHIP_DESCRIPTIONS[backward]}\n\n`
  }
  
  // 分析认知功能
  const type1Functions = MBTI_TYPES[type1.value].functions
  const type2Functions = MBTI_TYPES[type2.value].functions
  
  // 获取双方的主导和辅助功能
  const type1Dominant = type1Functions[0]
  const type1Auxiliary = type1Functions[1]
  const type2Dominant = type2Functions[0]
  const type2Auxiliary = type2Functions[1]
  
  // 添加主导功能分析
  const dominantPair1 = `${type1Dominant}-${type2Dominant}`
  const dominantPair2 = `${type2Dominant}-${type1Dominant}`
  
  for (const [pair, desc] of Object.entries(FUNCTION_POSITION_ANALYSIS.dominant)) {
    if (pair === dominantPair1 || pair === dominantPair2) {
      analysis += `主导功能分析：${desc}\n\n`
      break
    }
  }
  
  // 添加辅助功能分析
  const auxiliaryPair1 = `${type1Auxiliary}-${type2Auxiliary}`
  const auxiliaryPair2 = `${type2Auxiliary}-${type1Auxiliary}`
  
  for (const [pair, desc] of Object.entries(FUNCTION_POSITION_ANALYSIS.auxiliary)) {
    if (pair === auxiliaryPair1 || pair === auxiliaryPair2) {
      analysis += `辅助功能分析：${desc}`
      break
    }
  }
  
  return analysis
})

const switchItems = {
  E: { checked: '外倾', unchecked: '内倾' },
  N: { checked: 'N', unchecked: 'S' },
  F: { checked: 'F', unchecked: 'T' },
  J: { checked: 'J', unchecked: 'P' }
}

const showFunctionModal = ref(false)
const selectedFunction = ref(null)

const openFunctionDescription = (functionInfo) => {
  selectedFunction.value = {
    code: functionInfo.code,
    desc: functionInfo.fullDesc
  }
  showFunctionModal.value = true
}
</script>

<style scoped>
/* 基础样式 */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  min-width: 1000px;
}

/* 关系类型颜色映射 */
.relationship-title.identity { color: #333; border-color: #333; }
.relationship-title.neighbour { color: #16a34a; border-color: #16a34a; }
.relationship-title.pal { color: #2563eb; border-color: #2563eb; }
.relationship-title.novelty { color: #9333ea; border-color: #9333ea; }
.relationship-title.counterpart { color: #dc2626; border-color: #dc2626; }
.relationship-title.anima { color: #ea580c; border-color: #ea580c; }
.relationship-title.supplement { color: #0891b2; border-color: #0891b2; }
.relationship-title.enigma { color: #4f46e5; border-color: #4f46e5; }
.relationship-title.contrast { color: #be123c; border-color: #be123c; }
.relationship-title.tribesman { color: #854d0e; border-color: #854d0e; }
.relationship-title.complement { color: #0d9488; border-color: #0d9488; }
.relationship-title.cohort { color: #7c3aed; border-color: #7c3aed; }
.relationship-title.pedagogue { color: #0369a1; border-color: #0369a1; }
.relationship-title.suitemate { color: #15803d; border-color: #15803d; }
.relationship-title.advisor { color: #1d4ed8; border-color: #1d4ed8; }

.relationship-title {
  font-size: 1.6em;
  font-weight: bold;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid;
  border-radius: 20px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.connection-line {
  height: 2px;
  width: 40px;
  background: currentColor;
}

/* 布局相关 */
.personalities-container {
  display: flex;
  align-items: flex-start;
  gap: 40px;
  margin: 20px 0;
  position: relative;
}

.personality-card {
  flex: 1;
  min-width: 300px;
  position: relative;
  z-index: 1;
}

/* 关系显示相关 */
.relationship-floating {
  position: absolute;
  left: 50%;
  top: 120px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 2;
}

.relationship-header {
  margin-bottom: 30px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid #1976d2;
}

.relationship-header .relationship-detail {
  font-size: 1.3em;
  line-height: 2;
  color: #333;
  white-space: pre-line;
}

/* 功能相关样式 */
.highlight-note {
  font-size: 0.9em;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.highlight-note :deep(.n-icon) {
  color: #1976d2;
  flex-shrink: 0;
}

.cognitive-functions {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.functions-list {
  margin-top: 10px;
}

.function-item {
  display: flex;
  align-items: center;
  padding: 8px;
  margin: 4px 0;
  border-radius: 4px;
  background-color: #fff;
  transition: all 0.3s ease;
  cursor: pointer;
}

.function-item:hover {
  background-color: #f0f7ff;
}

.function-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e3f2fd;
  border-radius: 50%;
  margin-right: 12px;
  font-size: 0.9em;
  font-weight: bold;
  color: #1976d2;
  flex-shrink: 0;
}

.function-code {
  font-weight: bold;
  margin-right: 12px;
  color: #1976d2;
  width: 30px;
  flex-shrink: 0;
}

.function-desc {
  color: #666;
  min-width: 0;
  flex: 1;
}

/* 特殊状态样式 */
.inferior {
  background-color: #f5f5f5;
}

.inferior .function-number {
  background-color: #ffe0b2;
  color: #ff9800;
}

.inferior .function-code {
  color: #ff9800;
}

.highlighted {
  background-color: #e3f2fd;
  border-left: 4px solid #1976d2;
}

/* 模态框样式 */
.function-modal-content {
  padding: 16px;
}

.function-modal-code {
  display: block;
  font-size: 1.2em;
  margin-bottom: 12px;
  color: #1976d2;
}

.function-modal-desc {
  line-height: 1.6;
  color: #333;
}

/* 移动端适配 */
@media screen and (max-width: 1000px) {
  .container {
    min-width: unset;
    padding: 10px;
  }

  .personalities-container {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }

  .relationship-floating {
    position: relative;
    top: 0;
    left: 0;
    transform: none;
    margin: 10px 0;
    justify-content: center;
  }

  .relationship-header {
    padding: 16px;
    margin-bottom: 20px;
  }

  .relationship-header .relationship-detail {
    font-size: 1.1em;
    line-height: 1.8;
  }

  .personality-card {
    min-width: unset;
  }
}

/* 超小屏幕适配 */
@media screen and (max-width: 375px) {
  .switch-group {
    gap: 8px;
  }

  .switch-item {
    min-width: 60px;
  }

  .switch-item :deep(.n-switch) {
    min-width: 45px;
    height: 24px;
  }

  .function-item {
    font-size: 0.9em;
  }

  .personality-image {
    width: 80px;
    height: 80px;
  }
}

.relationship-title.dual-relationship {
  font-size: 1.4em;
  padding: 12px 24px;
}
</style> 