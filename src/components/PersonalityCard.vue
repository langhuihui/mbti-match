<template>
  <n-card class="personality-selector">
    <div class="personality-type">
      <n-text class="personality-title">{{ title }}</n-text>
      <n-text class="personality-result" v-if="type">
        {{ type }} - {{ MBTI_TYPES[type].name }}
      </n-text>
    </div>

    <div class="switch-group">
      <div
        v-for="(item, key) in switchItems"
        :key="key"
        class="switch-item"
      >
        <n-text class="switch-label">{{ item.label }}</n-text>
        <n-switch
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
    </div>

    <div class="personality-avatar">
      <img
        v-if="type"
        :src="MBTI_TYPES[type].image"
        :alt="type"
        class="personality-image"
      />
    </div>

    <!-- 八维认知功能显示 -->
    <div class="cognitive-functions-container" v-if="type">
      <n-text class="functions-title">八维认知功能</n-text>
      <TransitionGroup name="function-list" tag="div" class="functions-list">
        <div
          v-for="(func, index) in eightFunctions"
          :key="func.code"
          :class="['function-tag', getFunctionClass(index)]"
        >
          <span class="function-position">{{ index + 1 }}</span>
          <span class="function-code">{{ func.code }}</span>
          <span class="function-name">{{ func.name }}</span>
        </div>
      </TransitionGroup>
    </div>
  </n-card>
</template>

<script setup>
import { computed } from 'vue'
import { NCard, NSwitch, NText } from 'naive-ui'
import { MBTI_TYPES, COGNITIVE_FUNCTION_DESCRIPTIONS } from '../constants'

const props = defineProps({
  title: String,
  personality: Object,
  type: String,
  otherType: String
})

const emit = defineEmits(['update:personality'])

// 计算八维认知功能
const eightFunctions = computed(() => {
  if (!props.type || !MBTI_TYPES[props.type]) return []
  return MBTI_TYPES[props.type].functions.map(code => ({
    code,
    name: COGNITIVE_FUNCTION_DESCRIPTIONS[code]?.name || code
  }))
})

// 获取功能位的 CSS 类名
const getFunctionClass = (index) => {
  if (index === 0) return 'dominant'      // 主导功能
  if (index === 1) return 'auxiliary'     // 辅助功能
  if (index === 2) return 'tertiary'      // 第三功能
  if (index === 3) return 'inferior'      // 劣势功能
  if (index === 4) return 'opposing'      // 对立功能
  if (index === 5) return 'critical'      // 批判功能
  if (index === 6) return 'deceiving'     // 欺骗功能
  return 'demonic'                         // 魔鬼功能
}

const MBTI_GROUP_COLORS = {
  NT: '#9333ea', // 紫色 - 分析家族群
  NF: '#16a34a', // 绿色 - 外交家族群
  SJ: '#0891b2', // 蓝绿色 - 哨兵家族群
  SP: '#ca8a04'  // 金色 - 探险家族群
}

const switchItems = {
  E: { 
    checked: 'E', 
    unchecked: 'I',
    label: '外向 / 内向'
  },
  N: { 
    checked: 'N', 
    unchecked: 'S',
    label: '直觉 / 感知'
  },
  F: { 
    checked: 'F', 
    unchecked: 'T',
    label: '情感 / 思维'
  },
  J: { 
    checked: 'J', 
    unchecked: 'P',
    label: '判断 / 知觉'
  }
}

const getTypeColor = (type) => {
  if (!type) return '#60a5fa'
  
  const N_or_S = type[1]
  const T_or_F = type[2]
  
  if (N_or_S === 'N') {
    return T_or_F === 'T' ? MBTI_GROUP_COLORS.NT : MBTI_GROUP_COLORS.NF
  } else {
    return type[3] === 'J' ? MBTI_GROUP_COLORS.SJ : MBTI_GROUP_COLORS.SP
  }
}
</script>

<style scoped>
.personality-selector {
  background: white;
  border-radius: 8px;
}

.personality-type {
  text-align: center;
  margin-bottom: 24px;
}

.personality-title {
  font-size: 1.4em;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8px;
}

.personality-result {
  font-size: 1.2em;
  color: #666;
}

.switch-group {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 24px 0;
}

.switch-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 80px;
}

.switch-label {
  font-size: 0.85em;
  color: #666;
  white-space: nowrap;
}

.personality-avatar {
  display: flex;
  justify-content: center;
  margin: 24px 0 12px;
}

.personality-image {
  width: 140px;
  height: 140px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.personality-image:hover {
  transform: scale(1.05);
}

@media screen and (max-width: 768px) {
  .switch-group {
    gap: 12px;
  }

  .switch-item {
    min-width: 70px;
  }

  .personality-image {
    width: 120px;
    height: 120px;
  }
}

@media screen and (max-width: 375px) {
  .switch-group {
    gap: 8px;
  }

  .switch-item {
    min-width: 60px;
  }

  .switch-label {
    font-size: 0.8em;
  }
}

/* 八维认知功能样式 */
.cognitive-functions-container {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.functions-title {
  display: block;
  text-align: center;
  font-size: 0.95em;
  color: #64748b;
  margin-bottom: 12px;
}

.functions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  position: relative;
}

.function-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85em;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: default;
}

.function-position {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.75em;
  font-weight: bold;
}

.function-code {
  font-weight: bold;
  min-width: 20px;
}

.function-name {
  font-size: 0.9em;
  opacity: 0.9;
}

/* 主导功能 - 蓝色 */
.function-tag.dominant {
  background: #dbeafe;
  color: #1d4ed8;
}
.function-tag.dominant .function-position {
  background: #3b82f6;
  color: white;
}

/* 辅助功能 - 绿色 */
.function-tag.auxiliary {
  background: #dcfce7;
  color: #15803d;
}
.function-tag.auxiliary .function-position {
  background: #22c55e;
  color: white;
}

/* 第三功能 - 黄色 */
.function-tag.tertiary {
  background: #fef9c3;
  color: #a16207;
}
.function-tag.tertiary .function-position {
  background: #eab308;
  color: white;
}

/* 劣势功能 - 橙色 */
.function-tag.inferior {
  background: #fed7aa;
  color: #c2410c;
}
.function-tag.inferior .function-position {
  background: #f97316;
  color: white;
}

/* 对立功能 - 紫色 */
.function-tag.opposing {
  background: #e9d5ff;
  color: #7e22ce;
}
.function-tag.opposing .function-position {
  background: #a855f7;
  color: white;
}

/* 批判功能 - 粉色 */
.function-tag.critical {
  background: #fce7f3;
  color: #be185d;
}
.function-tag.critical .function-position {
  background: #ec4899;
  color: white;
}

/* 欺骗功能 - 青色 */
.function-tag.deceiving {
  background: #cffafe;
  color: #0e7490;
}
.function-tag.deceiving .function-position {
  background: #06b6d4;
  color: white;
}

/* 魔鬼功能 - 灰色 */
.function-tag.demonic {
  background: #f1f5f9;
  color: #475569;
}
.function-tag.demonic .function-position {
  background: #64748b;
  color: white;
}

/* TransitionGroup 动画 - FLIP 效果 */
.function-list-move {
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.function-list-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.function-list-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: absolute;
}

.function-list-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.function-list-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* 响应式样式 */
@media screen and (max-width: 768px) {
  .function-tag {
    padding: 4px 10px;
    font-size: 0.8em;
    gap: 4px;
  }

  .function-position {
    width: 16px;
    height: 16px;
    font-size: 0.7em;
  }

  .functions-list {
    gap: 6px;
  }
}

@media screen and (max-width: 375px) {
  .function-tag {
    padding: 3px 8px;
    font-size: 0.75em;
  }

  .function-name {
    display: none;
  }

  .function-position {
    width: 14px;
    height: 14px;
    font-size: 0.65em;
  }
}
</style>