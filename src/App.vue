<template>
  <n-config-provider>
    <n-message-provider>
      <div class="container">
        <!-- 选择视图 -->
        <div v-if="!showResult" class="selection-view">
          <n-text class="app-title" tag="h1">MBTI人格关系速查</n-text>
          
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

          <n-button
            v-if="type1 && type2"
            type="primary"
            size="large"
            class="view-result-button"
            @click="showResult = true"
          >
            查看关系分析
          </n-button>
        </div>

        <!-- 结果视图 -->
        <div v-else class="result-view">
          <div class="result-header">
            <n-button
              quaternary
              class="back-button"
              @click="showResult = false"
            >
              <template #icon>
                <n-icon><arrow-back /></n-icon>
              </template>
              返回选择
            </n-button>
            <div class="title-group">
              <n-text class="result-title" tag="h2">关系分析结果</n-text>
              <n-text class="result-subtitle">
                {{ relationshipType }}关系：{{ RELATIONSHIP_DESCRIPTIONS[relationshipCode.forward] }}
              </n-text>
            </div>
          </div>

          <div class="result-content">
            <div class="type-comparison">
              <div class="relationship-indicator">
                <n-text class="relationship-type" strong>
                  {{ relationshipType }}
                </n-text>
              </div>

              <div class="type-cards">
                <div class="type-card">
                  <n-text strong>{{ type1 }} - {{ MBTI_TYPES[type1].name }}</n-text>
                  <img
                    :src="MBTI_TYPES[type1].image"
                    :alt="type1"
                    class="type-image"
                  />
                </div>

                <div class="type-card">
                  <n-text strong>{{ type2 }} - {{ MBTI_TYPES[type2].name }}</n-text>
                  <img
                    :src="MBTI_TYPES[type2].image"
                    :alt="type2"
                    class="type-image"
                  />
                </div>
              </div>
            </div>

            <div class="cognitive-functions-comparison">
              <n-card title="认知功能对比" class="functions-card">
                <div class="functions-grid">
                  <div class="functions-column">
                    <div
                      v-for="(func, index) in cognitiveFunctions1List"
                      :key="index"
                      :class="['function-item', {
                        'inferior': func.isInferior,
                        'highlighted': isHighlighted(func.code, type1, type2)
                      }]"
                      @click="openFunctionDescription(func)"
                    >
                      <span class="function-number">{{ index + 1 }}</span>
                      <span class="function-code">{{ func.code }}</span>
                      <span class="function-desc">{{ func.desc }}</span>
                    </div>
                  </div>

                  <div class="functions-column">
                    <div
                      v-for="(func, index) in cognitiveFunctions2List"
                      :key="index"
                      :class="['function-item', {
                        'inferior': func.isInferior,
                        'highlighted': isHighlighted(func.code, type2, type1)
                      }]"
                      @click="openFunctionDescription(func)"
                    >
                      <span class="function-number">{{ index + 1 }}</span>
                      <span class="function-code">{{ func.code }}</span>
                      <span class="function-desc">{{ func.desc }}</span>
                    </div>
                  </div>
                </div>
              </n-card>
            </div>
          </div>
        </div>

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
  NModal,
  NButton
} from 'naive-ui'
import { ArrowBack } from '@vicons/ionicons5'
import PersonalityCard from './components/PersonalityCard.vue'
import { 
  MBTI_TYPES,
  COGNITIVE_FUNCTION_DESCRIPTIONS,
  FUNCTION_POSITION_ANALYSIS,
  RELATIONSHIP_DESCRIPTIONS
} from './constants'
import { getMbtiRelation } from './utils/mbtiRelations'

const showResult = ref(false)

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
  
  const currentFunctions = MBTI_TYPES[currentType].functions.slice(0, 4)
  const otherFunctions = MBTI_TYPES[otherType].functions.slice(0, 4)
  
  // 检查当前功能是否在两个类型的前四个功能中完全相同
  const currentIndex = currentFunctions.indexOf(functionCode)
  const otherIndex = otherFunctions.indexOf(functionCode)
  
  // 只有当功能代码完全相同，并且都在前四个功能中时才高亮
  return currentIndex !== -1 && currentIndex === otherIndex
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
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.selection-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}

.app-title {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
}

.personality-card {
  width: 100%;
  max-width: 600px;
}

.view-result-button {
  margin-top: 24px;
  width: 200px;
}

.result-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.result-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 32px;
}

.title-group {
  flex: 1;
  text-align: center;
}

.result-title {
  margin: 0;
  font-size: 1.5em;
  color: #1e293b;
  margin-bottom: 8px;
}

.result-subtitle {
  font-size: 1.1em;
  color: #64748b;
  line-height: 1.6;
}

.type-comparison {
  position: relative;
  margin-bottom: 32px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.type-cards {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 48px;
  width: 100%;
}

.relationship-indicator {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  background: white;
  padding: 4px;
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.relationship-type {
  font-size: 1.4em;
  padding: 8px 20px;
  background: #e3f2fd;
  border-radius: 20px;
  color: #1976d2;
  white-space: nowrap;
  display: block;
}

.type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 8px;
  min-width: 200px;
  z-index: 0;
}

.type-image {
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 8px;
}

.cognitive-functions-comparison {
  margin-top: 24px;
}

.functions-card {
  background: white;
}

.functions-grid {
  display: flex;
  justify-content: space-between;
  gap: 32px;
  padding: 8px;
}

.functions-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.function-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.function-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: transparent;
  transition: background-color 0.3s ease;
}

.function-item:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}

.function-number {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
  border-radius: 50%;
  margin-right: 12px;
  font-size: 0.9em;
  font-weight: bold;
  color: #475569;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.function-code {
  font-weight: bold;
  margin-right: 12px;
  color: #475569;
  width: 30px;
  flex-shrink: 0;
  font-size: 1.1em;
}

.function-desc {
  color: #64748b;
  font-size: 0.95em;
}

/* 主功能（前两个）样式 */
.function-item:nth-child(-n+2) {
  background: #f0f9ff;
}

.function-item:nth-child(-n+2) .function-number {
  background: #bae6fd;
  color: #0369a1;
}

.function-item:nth-child(-n+2) .function-code {
  color: #0369a1;
}

/* 辅助功能（第三、四个）样式 */
.function-item:nth-child(n+3) {
  background: #f8fafc;
}

.function-item:nth-child(n+3) .function-number {
  background: #e2e8f0;
  color: #475569;
}

/* 劣势功能（第四个）样式 */
.function-item:nth-child(4) {
  background: #f8fafc;
  opacity: 0.8;
}

.function-item:nth-child(4) .function-number {
  background: #e2e8f0;
  color: #94a3b8;
}

.function-item:nth-child(4) .function-code {
  color: #94a3b8;
}

.function-item:nth-child(4) .function-desc {
  color: #94a3b8;
}

/* 高亮相同功能位的样式 */
.function-item.highlighted {
  background: #ecfdf5;
  border: 1px solid #6ee7b7;
}

.function-item.highlighted::before {
  background: #10b981;
}

.function-item.highlighted .function-number {
  background: #6ee7b7;
  color: #065f46;
}

.function-item.highlighted .function-code {
  color: #047857;
}

.function-item.highlighted .function-desc {
  color: #047857;
}

/* 标题样式 */
.functions-card :deep(.n-card-header) {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.functions-card :deep(.n-card-header__main) {
  font-size: 1.2em;
  font-weight: bold;
  color: #1e293b;
}

@media screen and (max-width: 768px) {
  .result-header {
    margin-bottom: 24px;
  }

  .result-title {
    font-size: 1.3em;
  }

  .result-subtitle {
    font-size: 1em;
  }

  .type-cards {
    gap: 24px;
  }

  .type-card {
    min-width: 140px;
    padding: 16px;
  }

  .type-image {
    width: 100px;
    height: 100px;
  }

  .relationship-type {
    font-size: 1.2em;
    padding: 6px 16px;
  }

  .functions-grid {
    gap: 24px;
  }

  .function-item {
    padding: 8px 12px;
  }

  .function-number {
    width: 24px;
    height: 24px;
    font-size: 0.85em;
    margin-right: 8px;
  }

  .function-code {
    font-size: 1em;
    margin-right: 8px;
  }

  .function-desc {
    font-size: 0.9em;
  }
}

@media screen and (max-width: 480px) {
  .type-cards {
    gap: 16px;
  }

  .type-card {
    min-width: 120px;
    padding: 12px;
  }

  .type-image {
    width: 80px;
    height: 80px;
  }

  .relationship-type {
    font-size: 1em;
    padding: 4px 12px;
  }

  .functions-grid {
    gap: 16px;
  }

  .function-item {
    padding: 6px 10px;
  }

  .function-number {
    width: 20px;
    height: 20px;
    font-size: 0.8em;
    margin-right: 6px;
  }

  .function-code {
    font-size: 0.9em;
    margin-right: 6px;
  }

  .function-desc {
    font-size: 0.85em;
  }
}
</style> 