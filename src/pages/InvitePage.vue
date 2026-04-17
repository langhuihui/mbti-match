<template>
  <div class="invite-page page-container">
    <header class="page-header">
      <button class="back-btn" @click="$router.back()">←</button>
      <h1 class="header-title">邀请好友</h1>
      <div style="width:40px"></div>
    </header>

    <div class="container">
      <!-- My Type Display -->
      <div class="my-info">
        <img :src="typeInfo?.image" :alt="myType" class="my-avatar" />
        <div class="my-meta">
          <span class="my-type">{{ myType }}</span>
          <span class="my-name">{{ typeInfo?.name }}</span>
        </div>
      </div>

      <!-- Invite Card -->
      <div class="invite-card">
        <div class="invite-icon">💌</div>
        <h2 class="invite-title">邀请好友测试关系</h2>
        <p class="invite-desc">
          发送链接给好友，TA完成测试后，你们将同时收到关系化学分析结果
        </p>

        <!-- Link Section -->
        <div class="link-section" v-if="inviteCode">
          <div class="link-box">
            <span class="link-text">{{ inviteLink }}</span>
            <button class="copy-btn" @click="copyLink">
              {{ copied ? '✓ 已复制' : '复制' }}
            </button>
          </div>
          <p class="link-hint">将链接发送给好友即可</p>
        </div>

        <button 
          v-if="!inviteCode"
          class="btn btn-primary btn-lg" 
          @click="generateLink"
        >
          ✨ 生成邀请链接
        </button>
      </div>

      <!-- How It Works -->
      <div class="how-section">
        <h3 class="how-title">邀请流程</h3>
        <div class="steps">
          <div class="step">
            <div class="step-num">1</div>
            <div class="step-content">
              <span class="step-title">生成链接</span>
              <span class="step-desc">点击生成专属邀请链接</span>
            </div>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-num">2</div>
            <div class="step-content">
              <span class="step-title">好友测试</span>
              <span class="step-desc">好友打开链接选择类型</span>
            </div>
          </div>
          <div class="step-arrow">→</div>
          <div class="step">
            <div class="step-num">3</div>
            <div class="step-content">
              <span class="step-title">查看结果</span>
              <span class="step-desc">双方同时看到关系分析</span>
            </div>
          </div>
        </div>
      </div>

      <!-- If no type set -->
      <div class="no-type" v-if="!myType">
        <p>你还没有设置自己的MBTI类型</p>
        <button class="btn btn-primary" @click="$router.push({ path: '/test', query: { mode: 'single' } })">
          先测试我的类型
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMbtiStore } from '@/stores/mbti'

const store = useMbtiStore()
const copied = ref(false)
const inviteCode = ref('')

const myType = computed(() => store.myType)
const typeInfo = computed(() => store.getTypeInfo(myType.value))

const inviteLink = computed(() => {
  return `${window.location.origin}/match/${inviteCode.value}`
})

const generateLink = () => {
  const code = store.generateInviteCode()
  inviteCode.value = code
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(inviteLink.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // Fallback
    const input = document.createElement('input')
    input.value = inviteLink.value
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

<style scoped>
.invite-page {
  background: var(--color-bg);
}

.page-header {
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
}

.header-title {
  font-size: 1.1rem;
  font-weight: 700;
}

/* My Info */
.my-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  margin: var(--space-lg) 0;
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.my-avatar {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  object-fit: contain;
}

.my-meta {
  display: flex;
  flex-direction: column;
}

.my-type {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--color-primary);
}

.my-name {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

/* Invite Card */
.invite-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  text-align: center;
  box-shadow: var(--shadow-md);
  margin-bottom: var(--space-xl);
}

.invite-icon {
  font-size: 3rem;
  margin-bottom: var(--space-md);
}

.invite-title {
  font-size: 1.3rem;
  font-weight: 800;
  margin-bottom: var(--space-sm);
}

.invite-desc {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-xl);
}

/* Link Section */
.link-section {
  margin-top: var(--space-lg);
}

.link-box {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 8px 8px 8px 16px;
}

.link-text {
  flex: 1;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-btn {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  border: none;
  background: var(--color-primary);
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.copy-btn:hover {
  background: var(--color-primary-dark);
}

.link-hint {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  margin-top: 8px;
}

/* How Section */
.how-section {
  margin-bottom: var(--space-xl);
}

.how-title {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: var(--space-md);
  text-align: center;
}

.steps {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: var(--space-sm);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 120px;
}

.step-num {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-content {
  text-align: center;
}

.step-title {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 2px;
}

.step-desc {
  display: block;
  font-size: 0.7rem;
  color: var(--color-text-tertiary);
}

.step-arrow {
  margin-top: 8px;
  color: var(--color-text-tertiary);
  font-size: 1.2rem;
}

/* No Type */
.no-type {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-secondary);
}

.no-type .btn {
  margin-top: var(--space-md);
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
</style>
