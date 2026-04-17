<template>
  <div :class="['type-selector', { compact }]">
    <h3 class="selector-title">{{ title }}</h3>
    
    <div class="switch-row">
      <div 
        v-for="item in switchItems" 
        :key="item.key"
        class="switch-item"
      >
        <span class="switch-label">{{ item.label }}</span>
        <button 
          :class="['type-switch', { active: personality[item.key] }]"
          :style="{ '--active-color': groupColor }"
          @click="$emit('update', item.key, !personality[item.key])"
        >
          <span class="switch-thumb">
            {{ personality[item.key] ? item.checked : item.unchecked }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  personality: Object,
  compact: Boolean
})

const emit = defineEmits(['update'])

const switchItems = [
  { key: 'E', checked: 'E', unchecked: 'I', label: '外向/内向' },
  { key: 'N', checked: 'N', unchecked: 'S', label: '直觉/感知' },
  { key: 'F', checked: 'F', unchecked: 'T', label: '情感/思维' },
  { key: 'J', checked: 'J', unchecked: 'P', label: '判断/知觉' }
]

const typeStr = computed(() => {
  const p = props.personality
  return (p.E ? 'E' : 'I') + (p.N ? 'N' : 'S') + (p.F ? 'F' : 'T') + (p.J ? 'J' : 'P')
})

const groupColor = computed(() => {
  const t = typeStr.value
  if (t[1] === 'N') return t[2] === 'T' ? '#8b5cf6' : '#10b981'
  return t[3] === 'J' ? '#0ea5e9' : '#f59e0b'
})
</script>

<style scoped>
.type-selector {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

.type-selector.compact {
  padding: var(--space-md);
}

.selector-title {
  text-align: center;
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: var(--space-md);
  color: var(--color-text-primary);
}

.compact .selector-title {
  font-size: 0.9rem;
  margin-bottom: var(--space-sm);
}

.switch-row {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.switch-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.switch-label {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  white-space: nowrap;
}

.type-switch {
  width: 56px;
  height: 36px;
  border-radius: 8px;
  border: 2px solid var(--color-border);
  background: var(--color-bg);
  position: relative;
  cursor: pointer;
  transition: all var(--transition-normal);
  padding: 0;
}

.type-switch.active {
  background: var(--active-color, var(--color-primary));
  border-color: var(--active-color, var(--color-primary));
}

.switch-thumb {
  position: absolute;
  width: 28px;
  height: 28px;
  background: white;
  border-radius: 6px;
  top: 2px;
  left: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--color-primary);
  transition: all var(--transition-normal);
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}

.type-switch.active .switch-thumb {
  left: calc(100% - 30px);
  color: var(--active-color, var(--color-primary));
}
</style>
