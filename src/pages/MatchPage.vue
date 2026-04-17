<template>
  <div class="match-page page-container">
    <div class="container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载邀请信息...</p>
      </div>

      <!-- Invalid Code -->
      <div v-else-if="!inviteInfo" class="error-state">
        <div class="error-icon">😕</div>
        <h2>邀请已过期</h2>
        <p>这个邀请链接无效或已过期</p>
        <button class="btn btn-primary" @click="$router.push('/')">
          回到首页
        </button>
      </div>

      <!-- Match Flow -->
      <div v-else class="match-flow">
        <!-- Step 1: Inviter Info -->
        <div class="inviter-section">
          <div class="invite-badge">💌 好友邀请</div>
          <div class="inviter-card">
            <img :src="inviterInfo?.image" :alt="inviterType" class="inviter-avatar" />
            <span class="inviter-type">{{ inviterType }}</span>
            <span class="inviter-name">{{ inviterInfo?.name }}</span>
          </div>
          <p class="invite-message">TA想知道你们的关系化学式 ⚗️</p>
        </div>

        <!-- Step 2: Select Your Type -->
        <div class="select-section" v-if="!matched">
          <h2 class="select-title">选择你的MBTI类型</h2>
          
          <type-selector
            title=""
            :personality="personality"
            @update="updatePersonality"
          />

          <div class="my-preview">
            <img :src="myInfo?.image" :alt="myType" class="preview-avatar" />
            <span class="preview-type">{{ myType }}</span>
            <span class="preview-name">{{ myInfo?.name }}</span>
          </div>

          <button class="btn btn-primary btn-lg" @click="doMatch">
            🔮 揭晓关系化学式
          </button>
        </div>

        <!-- Step 3: Result Animation -->
        <div class="match-result" v-if="matched">
          <div class="result-animation">
            <div class="result-flash"></div>
          </div>

          <div class="match-types">
            <div class="match-side">
              <img :src="inviterInfo?.image" class="match-avatar" />
              <span class="match-type-label">{{ inviterType }}</span>
            </div>
            <div class="match-relation-badge" :class="relationClass">
              {{ relationship?.displayType }}
            </div>
            <div class="match-side">
              <img :src="myInfo?.image" class="match-avatar" />
              <span class="match-type-label">{{ myType }}</span>
            </div>
          </div>

          <p class="match-desc">{{ relationship?.forwardDesc }}</p>

          <div class="match-actions">
            <button class="btn btn-primary btn-lg" @click="viewDetail">
              查看详细分析 →
            </button>
            <button class="btn btn-outline" @click="$router.push('/')">
              回到首页
            </button>
          </div>
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

const loading = ref(true)
const matched = ref(false)
const inviteInfo = ref(null)
const personality = ref({ E: false, N: false, F: false, J: false })

const code = computed(() => route.params.code)
const inviterType = computed(() => inviteInfo.value?.type || '')
const inviterInfo = computed(() => store.getTypeInfo(inviterType.value))
const myType = computed(() => store.getTypeFromPersonality(personality.value))
const myInfo = computed(() => store.getTypeInfo(myType.value))
const relationship = computed(() => {
  if (!inviterType.value || !myType.value) return null
  return store.getRelationship(inviterType.value, myType.value)
})

const relationClass = computed(() => {
  const r = relationship.value?.forward || ''
  if (['本体', '陪伴', '伙伴'].includes(r)) return 'harmony'
  if (['全反', '对手', '新奇'].includes(r)) return 'tension'
  return 'neutral'
})

onMounted(() => {
  const info = store.getInviteInfo(code.value)
  inviteInfo.value = info
  loading.value = false
  
  if (store.myType) {
    const p = store.setPersonalityFromType(store.myType)
    personality.value = p
  }
})

const updatePersonality = (key, value) => {
  personality.value = { ...personality.value, [key]: value }
}

const doMatch = () => {
  store.saveMyType(myType.value)
  matched.value = true
}

const viewDetail = () => {
  router.push({
    path: '/result',
    query: { type1: inviterType.value, type2: myType.value }
  })
}
</script>

<style scoped>
.match-page {
  background: linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  color: white;
  min-height: 100vh;
}

/* Loading */
.loading-state, .error-state {
  text-align: center;
  padding: var(--space-3xl) var(--space-md);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255,255,255,0.2);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto var(--space-md);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: var(--space-md);
}

.error-state h2 {
  margin-bottom: var(--space-sm);
}

.error-state p {
  opacity: 0.7;
  margin-bottom: var(--space-xl);
}

/* Inviter Section */
.inviter-section {
  text-align: center;
  padding: var(--space-2xl) 0;
}

.invite-badge {
  display: inline-block;
  padding: 6px 20px;
  background: rgba(255,255,255,0.15);
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  margin-bottom: var(--space-xl);
}

.inviter-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: var(--space-lg);
}

.inviter-avatar {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-lg);
  object-fit: contain;
  background: rgba(255,255,255,0.1);
  padding: 8px;
}

.inviter-type {
  font-size: 1.5rem;
  font-weight: 800;
}

.inviter-name {
  font-size: 0.9rem;
  opacity: 0.7;
}

.invite-message {
  font-size: 1rem;
  opacity: 0.8;
}

/* Select Section */
.select-section {
  padding: var(--space-lg) 0;
  text-align: center;
}

.select-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: var(--space-lg);
}

.select-section :deep(.type-selector) {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.2);
  color: white;
}

.select-section :deep(.selector-title) {
  color: white;
}

.select-section :deep(.switch-label) {
  color: rgba(255,255,255,0.6);
}

.select-section :deep(.type-switch) {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.3);
}

.my-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: var(--space-xl) 0;
}

.preview-avatar {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  object-fit: contain;
  background: rgba(255,255,255,0.1);
  padding: 6px;
}

.preview-type {
  font-size: 1.3rem;
  font-weight: 800;
}

.preview-name {
  font-size: 0.85rem;
  opacity: 0.7;
}

/* Match Result */
.match-result {
  text-align: center;
  padding: var(--space-xl) 0;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.result-animation {
  position: relative;
  height: 4px;
  margin-bottom: var(--space-xl);
}

.result-flash {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
  border-radius: 2px;
  animation: flash 1s ease-out;
}

@keyframes flash {
  0% { opacity: 0; transform: scaleX(0); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: scaleX(1); }
}

.match-types {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.match-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.match-avatar {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-md);
  object-fit: contain;
  background: rgba(255,255,255,0.1);
  padding: 6px;
}

.match-type-label {
  font-weight: 700;
}

.match-relation-badge {
  padding: 10px 24px;
  border-radius: var(--radius-full);
  font-weight: 800;
  font-size: 1.1rem;
}

.match-relation-badge.harmony {
  background: rgba(16, 185, 129, 0.3);
  border: 1px solid rgba(16, 185, 129, 0.5);
}

.match-relation-badge.tension {
  background: rgba(239, 68, 68, 0.3);
  border: 1px solid rgba(239, 68, 68, 0.5);
}

.match-relation-badge.neutral {
  background: rgba(99, 102, 241, 0.3);
  border: 1px solid rgba(99, 102, 241, 0.5);
}

.match-desc {
  font-size: 0.95rem;
  opacity: 0.8;
  max-width: 300px;
  margin: 0 auto var(--space-xl);
  line-height: 1.6;
}

.match-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  align-items: center;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  border: none;
  border-radius: var(--radius-lg);
  font-weight: 600;
  cursor: pointer;
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

.btn-outline {
  padding: 12px 24px;
  background: transparent;
  color: rgba(255,255,255,0.7);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: var(--radius-lg);
  font-size: 0.9rem;
}

.btn-outline:hover {
  background: rgba(255,255,255,0.1);
  color: white;
}
</style>
