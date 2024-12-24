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
  </n-card>
</template>

<script setup>
import { NCard, NSwitch, NText } from 'naive-ui'
import { MBTI_TYPES } from '../constants'

const props = defineProps({
  title: String,
  personality: Object,
  type: String,
  otherType: String
})

const emit = defineEmits(['update:personality'])

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
</style> 