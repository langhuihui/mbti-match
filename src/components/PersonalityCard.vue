<template>
  <n-card class="personality-selector">
    <div class="personality-type">
      <n-text class="personality-title">{{ title }}：{{ type }} - {{ type && MBTI_TYPES[type].name || '请选择完整的人格类型' }}</n-text>
    </div>
    <div class="switch-group">
      <n-switch
        v-for="(item, key) in switchItems"
        :key="key"
        :value="personality[key]"
        :round="false"
        :rail-style="() => ({
          background: getTypeColor(type)
        })"
        @update:value="val => $emit('update:personality', val, key)"
      >
        <template #checked>{{ item.checked }}</template>
        <template #unchecked>{{ item.unchecked }}</template>
      </n-switch>
    </div>
    <div class="personality-avatar">
      <img
        v-if="type"
        :src="MBTI_TYPES[type].image"
        :alt="type"
        class="personality-image"
      />
    </div>
    <div class="cognitive-functions">
      <n-text strong>认知功能：</n-text>
      <div class="functions-list">
        <div
          v-for="(func, index) in cognitiveFunctions"
          :key="index"
          :class="['function-item', {
            'inferior': index >= 4,
            'highlighted': isHighlighted(func.code, type, otherType)
          }]"
          @click="emit('openFunctionDescription', func)"
        >
          <span class="function-number">{{ index + 1 }}</span>
          <span class="function-code">{{ func.code }}</span>
          <span class="function-desc">{{ func.desc }}</span>
        </div>
      </div>
    </div>
  </n-card>
</template>

<script setup>
import { NCard, NSwitch, NText } from 'naive-ui'
import { MBTI_TYPES } from '../constants'

const props = defineProps({
  title: String,
  personality: Object,
  type: String,
  cognitiveFunctions: Array,
  otherType: String
})

const emit = defineEmits(['update:personality', 'openFunctionDescription'])

const MBTI_GROUP_COLORS = {
  NT: '#9333ea', // 紫色 - 分析家族群
  NF: '#16a34a', // 绿色 - 外交家族群
  SJ: '#0891b2', // 蓝绿色 - 哨兵家族群
  SP: '#ca8a04'  // 金色 - 探险家族群
}

const switchItems = {
  E: { checked: 'E', unchecked: 'I' },
  N: { checked: 'N', unchecked: 'S' },
  F: { checked: 'F', unchecked: 'T' },
  J: { checked: 'J', unchecked: 'P' }
}

const getTypeColor = (type) => {
  if (!type) return '#60a5fa'
  
  // 获取第2、3个字母来判断族群
  const N_or_S = type[1]
  const T_or_F = type[2]
  
  if (N_or_S === 'N') {
    return T_or_F === 'T' ? MBTI_GROUP_COLORS.NT : MBTI_GROUP_COLORS.NF
  } else {
    return type[3] === 'J' ? MBTI_GROUP_COLORS.SJ : MBTI_GROUP_COLORS.SP
  }
}

const isHighlighted = (functionCode, currentType, otherType) => {
  if (!currentType || !otherType) return false
  
  const currentFunctions = MBTI_TYPES[currentType].functions
  const otherFunctions = MBTI_TYPES[otherType].functions
  
  const currentIndex = currentFunctions.indexOf(functionCode)
  const otherIndex = otherFunctions.indexOf(functionCode)
  
  if (currentIndex !== -1 && otherIndex !== -1) {
    return Math.abs(currentIndex - otherIndex) <= 1
  }
  
  return false
}
</script>

<style scoped>
.personality-selector {
  flex: 1;
}

.switch-group {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 16px;
  padding: 12px 0;
  margin: 0;
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

.personality-type {
  text-align: center;
  margin-bottom: 12px;
}

.personality-title {
  font-size: 1.2em;
  font-weight: bold;
  color: #333;
  display: block;
}

.personality-avatar {
  display: flex;
  justify-content: center;
  margin: 12px 0;
}

.personality-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

@media screen and (max-width: 768px) {
  .switch-group {
    flex-wrap: wrap;
    gap: 12px;
    padding: 8px 0;
    justify-content: center;
  }

  .function-item {
    padding: 6px;
  }

  .function-number {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    font-size: 0.8em;
  }

  .function-code {
    margin-right: 8px;
    width: 25px;
  }

  .function-desc {
    font-size: 0.9em;
  }

  .personality-image {
    width: 100px;
    height: 100px;
  }
}

@media screen and (max-width: 375px) {
  .switch-group {
    gap: 8px;
  }

  .function-item {
    font-size: 0.9em;
  }

  .personality-image {
    width: 80px;
    height: 80px;
  }
}
</style> 