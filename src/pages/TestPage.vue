<template>
  <div class="test-page page-container">
    <header class="test-header">
      <button class="back-btn" @click="$router.push('/')">
        <span>←</span>
      </button>
      <h1 class="test-title">{{ mode === 'dual' ? '关系匹配' : '探索人格' }}</h1>
    </header>

    <div class="container">
      <!-- Mode Tabs -->
      <div class="mode-tabs">
        <button 
          :class="['tab', { active: mode === 'single' }]"
          @click="mode = 'single'"
        >
          <span class="tab-icon">🧬</span>
          <span>探索人格</span>
        </button>
        <button 
          :class="['tab', { active: mode === 'dual' }]"
          @click="mode = 'dual'"
        >
          <span class="tab-icon">💕</span>
          <span>关系匹配</span>
        </button>
      </div>

      <!-- Single Mode: One Type Selector -->
      <div v-if="mode === 'single'" class="single-mode">
        <type-selector
          title="选择你的MBTI类型"
          :personality="personality1"
          @update="updatePersonality1"
        />

        <div class="type-preview" v-if="type1Info">
          <img :src="type1Info.image" :alt="type1" class="type-avatar" />
          <div class="type-meta">
            <span class="type-code">{{ type1 }}</span>
            <span class="type-name">{{ type1Info.name }}</span>
          </div>
        </div>

        <!-- Cognitive Functions Display -->
        <div class="functions-section">
          <h3 class="section-label">八维认知功能栈</h3>
          <div class="functions-stack">
            <div 
              v-for="(func, i) in functions1" 
              :key="func.code + i"
              :class="['func-row', funcClasses[i]]"
            >
              <div class="func-position">
                <span class="pos-num">{{ i + 1 }}</span>
                <span class="pos-name">{{ func.positionName }}</span>
              </div>
              <div class="func-info">
                <span class="func-code">{{ func.code }}</span>
                <span class="func-name">{{ func.name }}</span>
              </div>
              <span class="func-english">{{ func.positionEnglish }}</span>
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="btn btn-primary btn-lg" @click="saveAndViewCard">
            生成我的人格名片
          </button>
        </div>
      </div>

      <!-- Dual Mode: Two Type Selectors -->
      <div v-if="mode === 'dual'" class="dual-mode">
        <type-selector
          title="第一个人格"
          :personality="personality1"
          @update="updatePersonality1"
          compact
        />

        <div class="vs-divider">
          <div class="vs-line"></div>
          <span class="vs-text">VS</span>
          <div class="vs-line"></div>
        </div>

        <type-selector
          title="第二个人格"
          :personality="personality2"
          @update="updatePersonality2"
          compact
        />

        <!-- Mini Preview -->
        <div class="dual-preview">
          <div class="dual-type">
            <img :src="type1Info?.image" :alt="type1" class="mini-avatar" />
            <span class="mini-type">{{ type1 }}</span>
          </div>
          <span class="dual-relation">{{ relationship?.displayType || '…' }}</span>
          <div class="dual-type">
            <img :src="type2Info?.image" :alt="type2" class="mini-avatar" />
            <span class="mini-type">{{ type2 }}</span>
          </div>
        </div>

        <div class="actions">
          <button class="btn btn-primary btn-lg" @click="viewResult">
            查看关系分析 →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMbtiStore } from '@/stores/mbti'
import TypeSelector from '@/components/TypeSelector.vue'

const router = useRouter()
const route = useRoute()
const store = useMbtiStore()

const mode = ref(route.query.mode || 'single')
const personality1 = ref({ ...store.personality1 })
const personality2 = ref({ ...store.personality2 })

const funcClasses = ['dominant', 'auxiliary', 'tertiary', 'inferior', 'opposing', 'critical', 'deceiving', 'demonic']

const type1 = computed(() => store.getTypeFromPersonality(personality1.value))
const type2 = computed(() => store.getTypeFromPersonality(personality2.value))
const type1Info = computed(() => store.getTypeInfo(type1.value))
const type2Info = computed(() => store.getTypeInfo(type2.value))
const functions1 = computed(() => store.getCognitiveFunctions(type1.value))
const relationship = computed(() => store.getRelationship(type1.value, type2.value))

onMounted(() => {
  // If user already has a type, pre-fill
  if (store.myType && mode.value === 'single') {
    const p = store.setPersonalityFromType(store.myType)
    personality1.value = p
  }
})

const updatePersonality1 = (key, value) => {
  personality1.value = { ...personality1.value, [key]: value }
  store.personality1 = { ...personality1.value }
}

const updatePersonality2 = (key, value) => {
  personality2.value = { ...personality2.value, [key]: value }
  store.personality2 = { ...personality2.value }
}

const saveAndViewCard = () => {
  store.saveMyType(type1.value)
  router.push({ path: '/card', query: { type: type1.value } })
}

const viewResult = () => {
  router.push({ path: '/result', query: { type1: type1.value, type2: type2.value } })
}
</script>

<style scoped>
.test-page {
  background: var(--color-bg);
}

.test-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.back-btn:hover {
  background: var(--color-primary-50);
  border-color: var(--color-primary);
}

.test-title {
  font-size: 1.2rem;
  font-weight: 700;
}

/* Mode Tabs */
.mode-tabs {
  display: flex;
  gap: var(--space-sm);
  margin: var(--space-lg) 0;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 4px;
  border: 1px solid var(--color-border);
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: 12px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  transition: all var(--transition-normal);
}

.tab.active {
  background: var(--color-primary);
  color: white;
  box-shadow: var(--shadow-md);
}

.tab-icon {
  font-size: 1.1rem;
}

/* Type Preview */
.type-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  margin: var(--space-xl) 0;
  padding: var(--space-lg);
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.type-avatar {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-lg);
  object-fit: contain;
  transition: transform var(--transition-spring);
}

.type-avatar:hover {
  transform: scale(1.05) rotate(2deg);
}

.type-meta {
  text-align: center;
}

.type-code {
  display: block;
  font-size: 1.8rem;
  font-weight: 900;
  color: var(--color-primary);
  letter-spacing: 0.05em;
}

.type-name {
  display: block;
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

/* Functions Stack */
.functions-section {
  margin: var(--space-xl) 0;
}

.section-label {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
  text-align: center;
}

.functions-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.func-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.func-row:hover {
  transform: translateX(4px);
}

.func-position {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
}

.pos-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
}

.pos-name {
  font-size: 0.8rem;
  font-weight: 500;
}

.func-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.func-code {
  font-weight: 800;
  font-size: 1.05rem;
}

.func-name {
  font-size: 0.85rem;
  opacity: 0.8;
}

.func-english {
  font-size: 0.7rem;
  opacity: 0.5;
  font-style: italic;
}

/* Function Colors */
.func-row.dominant { background: #dbeafe; color: #1d4ed8; }
.func-row.dominant .pos-num { background: #3b82f6; }
.func-row.auxiliary { background: #dcfce7; color: #15803d; }
.func-row.auxiliary .pos-num { background: #22c55e; }
.func-row.tertiary { background: #fef9c3; color: #a16207; }
.func-row.tertiary .pos-num { background: #eab308; }
.func-row.inferior { background: #fed7aa; color: #c2410c; }
.func-row.inferior .pos-num { background: #f97316; }
.func-row.opposing { background: #e9d5ff; color: #7e22ce; }
.func-row.opposing .pos-num { background: #a855f7; }
.func-row.critical { background: #fce7f3; color: #be185d; }
.func-row.critical .pos-num { background: #ec4899; }
.func-row.deceiving { background: #cffafe; color: #0e7490; }
.func-row.deceiving .pos-num { background: #06b6d4; }
.func-row.demonic { background: #f1f5f9; color: #475569; }
.func-row.demonic .pos-num { background: #64748b; }

/* VS Divider */
.vs-divider {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin: var(--space-lg) 0;
}

.vs-line {
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.vs-text {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--color-text-tertiary);
  background: linear-gradient(135deg, var(--color-primary), #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Dual Preview */
.dual-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  margin: var(--space-xl) 0;
  padding: var(--space-lg);
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.dual-type {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.mini-avatar {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  object-fit: contain;
}

.mini-type {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-text-primary);
}

.dual-relation {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-primary);
  padding: 8px 16px;
  background: var(--color-primary-50);
  border-radius: var(--radius-full);
}

/* Actions */
.actions {
  display: flex;
  justify-content: center;
  margin: var(--space-xl) 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  border: none;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: 1rem;
  transition: all var(--transition-normal);
}

.btn-lg {
  padding: 16px 32px;
  font-size: 1.05rem;
  min-width: 240px;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
}
</style>
