<template>
  <div class="result-page page-container">
    <header class="result-header">
      <button class="back-btn" @click="$router.back()">←</button>
      <h1 class="header-title">关系分析</h1>
      <button class="share-btn" @click="shareResult">分享</button>
    </header>

    <div class="container">
      <!-- Relationship Badge -->
      <div class="relation-hero">
        <div class="relation-badge" :class="relationClass">
          <span class="badge-text">{{ relationship.displayType }}</span>
        </div>
        <p class="relation-desc">{{ relationship.forwardDesc }}</p>
      </div>

      <!-- Type VS -->
      <div class="type-vs">
        <div class="type-side">
          <img :src="type1Info?.image" :alt="type1" class="type-img" />
          <span class="type-label">{{ type1 }}</span>
          <span class="type-sub">{{ type1Info?.name }}</span>
        </div>
        <div class="vs-center">
          <div class="vs-icon">⚡</div>
        </div>
        <div class="type-side">
          <img :src="type2Info?.image" :alt="type2" class="type-img" />
          <span class="type-label">{{ type2 }}</span>
          <span class="type-sub">{{ type2Info?.name }}</span>
        </div>
      </div>

      <!-- Asymmetric Relationship -->
      <div class="asymmetric-info" v-if="!relationship.isSymmetric">
        <div class="asym-row">
          <span class="asym-direction">{{ type1 }} → {{ type2 }}</span>
          <span class="asym-type">{{ relationship.forward }}</span>
        </div>
        <p class="asym-desc">{{ relationship.forwardDesc }}</p>
        <div class="asym-divider"></div>
        <div class="asym-row">
          <span class="asym-direction">{{ type2 }} → {{ type1 }}</span>
          <span class="asym-type">{{ relationship.backward }}</span>
        </div>
        <p class="asym-desc">{{ relationship.backwardDesc }}</p>
      </div>

      <!-- Cognitive Function Collision -->
      <div class="collision-section">
        <h2 class="section-title">🧠 认知功能碰撞</h2>
        <p class="section-desc">看看你们的认知功能如何互动</p>
        
        <div class="collision-list">
          <div 
            v-for="(col, i) in collisions" 
            :key="i"
            :class="['collision-item', funcClasses[i]]"
          >
            <div class="col-header">
              <span class="col-position">{{ col.position }}功能</span>
              <span :class="['col-relation', col.relation]">{{ col.relation }}</span>
            </div>
            <div class="col-body">
              <div class="col-func">
                <span class="col-code">{{ col.func1.code }}</span>
                <span class="col-name">{{ col.func1.name }}</span>
              </div>
              <span :class="['col-arrow', { same: col.isSame }]">
                {{ col.isSame ? '=' : '↔' }}
              </span>
              <div class="col-func">
                <span class="col-code">{{ col.func2.code }}</span>
                <span class="col-name">{{ col.func2.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Full Functions Comparison -->
      <div class="comparison-section">
        <h2 class="section-title">📊 八维功能对比</h2>
        
        <div class="comparison-grid">
          <div class="comp-header">
            <span>{{ type1 }}</span>
            <span>功能位</span>
            <span>{{ type2 }}</span>
          </div>
          <div 
            v-for="(_, i) in 8" 
            :key="i"
            :class="['comp-row', funcClasses[i], { highlighted: functions1[i]?.code === functions2[i]?.code }]"
          >
            <div class="comp-cell left">
              <span class="comp-code">{{ functions1[i]?.code }}</span>
              <span class="comp-name">{{ functions1[i]?.name }}</span>
            </div>
            <div class="comp-cell center">
              <span class="comp-pos">{{ posNames[i] }}</span>
            </div>
            <div class="comp-cell right">
              <span class="comp-code">{{ functions2[i]?.code }}</span>
              <span class="comp-name">{{ functions2[i]?.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="result-actions">
        <button class="btn btn-primary btn-lg" @click="inviteFriend">
          💌 邀请好友测试关系
        </button>
        <button class="btn btn-outline" @click="testAgain">
          🔄 换人测试
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMbtiStore } from '@/stores/mbti'

const router = useRouter()
const route = useRoute()
const store = useMbtiStore()

const type1 = computed(() => route.query.type1 || 'INFP')
const type2 = computed(() => route.query.type2 || 'ENTJ')

const type1Info = computed(() => store.getTypeInfo(type1.value))
const type2Info = computed(() => store.getTypeInfo(type2.value))
const relationship = computed(() => store.getRelationship(type1.value, type2.value))
const collisions = computed(() => store.getCognitiveFunctionCollision(type1.value, type2.value))
const functions1 = computed(() => store.getCognitiveFunctions(type1.value))
const functions2 = computed(() => store.getCognitiveFunctions(type2.value))

const funcClasses = ['dominant', 'auxiliary', 'tertiary', 'inferior', 'opposing', 'critical', 'deceiving', 'demonic']
const posNames = ['主导', '辅助', '第三', '劣势', '对立', '批判', '欺骗', '魔鬼']

const relationClass = computed(() => {
  const r = relationship.value.forward
  if (['本体', '陪伴', '伙伴'].includes(r)) return 'harmony'
  if (['全反', '对手', '新奇'].includes(r)) return 'tension'
  return 'neutral'
})

const shareResult = () => {
  if (navigator.share) {
    navigator.share({
      title: `${type1.value} × ${type2.value} 的关系化学式`,
      text: `我们是${relationship.value.displayType}关系！来测测你和我的关系 →`,
      url: window.location.href
    })
  }
}

const inviteFriend = () => {
  store.saveMyType(type1.value)
  router.push('/invite')
}

const testAgain = () => {
  router.push({ path: '/test', query: { mode: 'dual' } })
}
</script>

<style scoped>
.result-page {
  background: var(--color-bg);
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn, .share-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.share-btn {
  font-size: 0.8rem;
  width: auto;
  padding: 0 12px;
  font-weight: 600;
  color: var(--color-primary);
}

.header-title {
  font-size: 1.1rem;
  font-weight: 700;
}

/* Relation Hero */
.relation-hero {
  text-align: center;
  padding: var(--space-xl) 0;
}

.relation-badge {
  display: inline-block;
  padding: 12px 32px;
  border-radius: var(--radius-full);
  font-size: 1.3rem;
  font-weight: 800;
  margin-bottom: var(--space-md);
}

.relation-badge.harmony {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #15803d;
}

.relation-badge.tension {
  background: linear-gradient(135deg, #fef2f2, #fecaca);
  color: #dc2626;
}

.relation-badge.neutral {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  color: #4f46e5;
}

.badge-text {
  letter-spacing: 0.05em;
}

.relation-desc {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  max-width: 300px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Type VS */
.type-vs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  padding: var(--space-lg);
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--space-xl);
}

.type-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.type-img {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  object-fit: contain;
}

.type-label {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--color-text-primary);
}

.type-sub {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
}

.vs-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.vs-icon {
  font-size: 1.5rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-50);
  border-radius: 50%;
}

/* Asymmetric */
.asymmetric-info {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
  box-shadow: var(--shadow-sm);
}

.asym-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.asym-direction {
  font-weight: 600;
  color: var(--color-text-primary);
}

.asym-type {
  font-weight: 700;
  color: var(--color-primary);
  padding: 4px 12px;
  background: var(--color-primary-50);
  border-radius: var(--radius-full);
  font-size: 0.9rem;
}

.asym-desc {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.asym-divider {
  height: 1px;
  background: var(--color-divider);
  margin: var(--space-md) 0;
}

/* Collision */
.collision-section, .comparison-section {
  margin-bottom: var(--space-xl);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 4px;
}

.section-desc {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}

.collision-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.collision-item {
  border-radius: var(--radius-md);
  padding: var(--space-md);
  transition: all var(--transition-normal);
}

.collision-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.col-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.col-position {
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.8;
}

.col-relation {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  background: rgba(255,255,255,0.5);
}

.col-relation.共鸣 { background: #dcfce7; color: #15803d; }
.col-relation.互补 { background: #dbeafe; color: #1d4ed8; }
.col-relation.碰撞 { background: #fef2f2; color: #dc2626; }
.col-relation.交织 { background: #fef9c3; color: #a16207; }

.col-body {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
}

.col-func {
  display: flex;
  align-items: center;
  gap: 6px;
}

.col-code {
  font-weight: 800;
  font-size: 1.1rem;
}

.col-name {
  font-size: 0.8rem;
  opacity: 0.7;
}

.col-arrow {
  font-size: 1.2rem;
  font-weight: 700;
  opacity: 0.5;
}

.col-arrow.same {
  color: #10b981;
  opacity: 1;
}

/* Collision Colors */
.collision-item.dominant { background: #dbeafe; color: #1d4ed8; }
.collision-item.auxiliary { background: #dcfce7; color: #15803d; }
.collision-item.tertiary { background: #fef9c3; color: #a16207; }
.collision-item.inferior { background: #fed7aa; color: #c2410c; }

/* Comparison Grid */
.comparison-grid {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.comp-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 8px;
  padding: 12px 16px;
  background: var(--color-primary);
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
  text-align: center;
}

.comp-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--color-divider);
  transition: all var(--transition-fast);
}

.comp-row:last-child {
  border-bottom: none;
}

.comp-row.highlighted {
  background: #ecfdf5;
}

.comp-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.comp-cell.left { justify-content: flex-start; }
.comp-cell.center { justify-content: center; }
.comp-cell.right { justify-content: flex-end; }

.comp-code {
  font-weight: 700;
  font-size: 0.95rem;
}

.comp-name {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

.comp-pos {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-tertiary);
  min-width: 40px;
  text-align: center;
}

/* Actions */
.result-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  align-items: center;
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
  transition: all var(--transition-normal);
  cursor: pointer;
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

.btn-outline {
  padding: 12px 24px;
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: 0.95rem;
}

.btn-outline:hover {
  background: var(--color-bg);
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
