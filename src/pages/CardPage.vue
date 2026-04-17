<template>
  <div class="card-page page-container">
    <header class="card-header">
      <button class="back-btn" @click="$router.back()">←</button>
      <h1 class="header-title">人格名片</h1>
      <button class="action-btn" @click="downloadCard">保存</button>
    </header>

    <div class="container">
      <!-- Card Preview -->
      <div class="card-wrapper">
        <div class="personality-card" ref="cardRef" :class="cardTheme">
          <div class="card-bg-pattern"></div>
          
          <div class="card-content">
            <!-- Top Section -->
            <div class="card-top">
              <div class="card-badge">MBTI Match</div>
              <div class="card-motto">{{ motto }}</div>
            </div>

            <!-- Avatar & Type -->
            <div class="card-center">
              <img :src="typeInfo?.image" :alt="type" class="card-avatar" />
              <div class="card-type-info">
                <span class="card-type">{{ type }}</span>
                <span class="card-name">{{ typeInfo?.name }}</span>
              </div>
            </div>

            <!-- Cognitive Functions -->
            <div class="card-functions">
              <div 
                v-for="(func, i) in functions.slice(0, 4)" 
                :key="i"
                class="card-func"
              >
                <div class="card-func-bar" :style="{ width: barWidths[i] }"></div>
                <span class="card-func-code">{{ func.code }}</span>
                <span class="card-func-label">{{ func.positionName }}</span>
              </div>
            </div>

            <!-- Tags -->
            <div class="card-tags">
              <span v-for="tag in tags" :key="tag" class="card-tag">#{{ tag }}</span>
            </div>

            <!-- Footer -->
            <div class="card-footer">
              <span class="card-slogan">「 {{ slogan }} 」</span>
              <span class="card-cta">扫码测测你是谁</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Theme Selector -->
      <div class="theme-section">
        <h3 class="theme-title">选择主题</h3>
        <div class="theme-options">
          <button 
            v-for="theme in themes" 
            :key="theme.id"
            :class="['theme-btn', { active: cardTheme === theme.id }]"
            :style="{ background: theme.preview }"
            @click="cardTheme = theme.id"
          >
            {{ theme.label }}
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="card-actions">
        <button class="btn btn-primary btn-lg" @click="shareCard">
          💌 分享名片
        </button>
        <button class="btn btn-secondary-solid btn-lg" @click="inviteFriend">
          💕 邀请好友测关系
        </button>
        <button class="btn btn-outline" @click="$router.push({ path: '/test', query: { mode: 'single' } })">
          ← 返回修改
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMbtiStore } from '@/stores/mbti'

const router = useRouter()
const route = useRoute()
const store = useMbtiStore()

const cardRef = ref(null)
const cardTheme = ref('cosmic')

const type = computed(() => route.query.type || store.myType || 'INFP')
const typeInfo = computed(() => store.getTypeInfo(type.value))
const functions = computed(() => store.getCognitiveFunctions(type.value))

const barWidths = ['95%', '80%', '60%', '45%']

const themes = [
  { id: 'cosmic', label: '星空', preview: 'linear-gradient(135deg, #0f0c29, #302b63)' },
  { id: 'sunrise', label: '日出', preview: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { id: 'ocean', label: '海洋', preview: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' },
  { id: 'forest', label: '森林', preview: 'linear-gradient(135deg, #10b981, #059669)' }
]

// 类型标签映射
const tagMap = {
  INFP: ['理想主义', '共情力MAX', '脑洞大开', '内心世界丰富'],
  INFJ: ['洞察力', '理想主义', '完美主义', '深思熟虑'],
  INTP: ['逻辑控', '知识探索者', '独立思考', '创新思维'],
  INTJ: ['战略家', '独立', '高效执行', '远见卓识'],
  ENFP: ['热情似火', '创意无限', '社交达人', '追求新鲜'],
  ENFJ: ['天生领袖', '助人为乐', '感染力强', '理想主义'],
  ENTP: ['辩论高手', '创新者', '思维跳跃', '挑战规则'],
  ENTJ: ['指挥官', '效率至上', '目标驱动', '决断力强'],
  ISFP: ['艺术灵魂', '自由追求', '温柔力量', '活在当下'],
  ISFJ: ['守护者', '可靠', '细心体贴', '传统价值'],
  ISTP: ['手艺人', '冷静分析', '行动派', '独立探索'],
  ISTJ: ['责任感', '有条不紊', '值得信赖', '脚踏实地'],
  ESFP: ['表演者', '活力四射', '享受当下', '天生乐观'],
  ESFJ: ['暖心人', '社交能手', '乐于助人', '组织力强'],
  ESTP: ['冒险家', '果断行动', '灵活应变', '享受刺激'],
  ESTJ: ['管理者', '高效执行', '秩序维护', '领导力强']
}

const mottoMap = {
  INFP: '🌙 月光下的诗人',
  INFJ: '🔮 灵魂的洞察者',
  INTP: '🔬 真理的探寻者',
  INTJ: '♟️ 棋局的布局者',
  ENFP: '🌈 可能性的追梦人',
  ENFJ: '🌟 灵魂的引路人',
  ENTP: '💡 规则的挑战者',
  ENTJ: '⚔️ 世界的征服者',
  ISFP: '🎨 自由的艺术家',
  ISFJ: '🛡️ 温暖的守护者',
  ISTP: '🔧 精准的工匠',
  ISTJ: '📋 秩序的守卫',
  ESFP: '🎪 舞台的焦点',
  ESFJ: '☕ 温暖的港湾',
  ESTP: '🏄 浪尖的冒险家',
  ESTJ: '🏛️ 规则的制定者'
}

const sloganMap = {
  INFP: '在平凡的世界里，寻找不平凡的意义',
  INFJ: '透过表象，看见灵魂的真相',
  INTP: '真理不在远方，在每一个问号的深处',
  INTJ: '未来，是我亲手设计的蓝图',
  ENFP: '生活是一场充满可能性的冒险',
  ENFJ: '让每个人都成为更好的自己',
  ENTP: '如果规则不合理，那就改写它',
  ENTJ: '效率是通往卓越的唯一道路',
  ISFP: '美，就在此刻的呼吸之间',
  ISFJ: '我守护的，是最珍贵的日常',
  ISTP: '用双手理解这个世界',
  ISTJ: '承诺了，就一定做到',
  ESFP: '人生苦短，及时行乐',
  ESFJ: '你的快乐，就是我的快乐',
  ESTP: '行动，是最好的语言',
  ESTJ: '秩序之上，效率之巅'
}

const tags = computed(() => tagMap[type.value] || ['MBTI', '人格', '认知功能'])
const motto = computed(() => mottoMap[type.value] || '探索自我')
const slogan = computed(() => sloganMap[type.value] || '理解自己，理解关系')

const shareCard = () => {
  if (navigator.share) {
    navigator.share({
      title: `我是${type.value}${typeInfo.value?.name}`,
      text: `${motto.value} — ${slogan.value}。来测测你是什么类型？`,
      url: window.location.origin
    })
  } else {
    alert('名片已复制到剪贴板！发给朋友看看吧～')
  }
}

const downloadCard = () => {
  alert('名片已保存！长按图片可分享到朋友圈')
}

const inviteFriend = () => {
  store.saveMyType(type.value)
  router.push('/invite')
}
</script>

<style scoped>
.card-page {
  background: var(--color-bg);
}

.card-header {
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

.back-btn, .action-btn {
  height: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.back-btn { width: 40px; font-size: 1.2rem; }
.action-btn { padding: 0 16px; font-weight: 600; color: var(--color-primary); }

.header-title {
  font-size: 1.1rem;
  font-weight: 700;
}

/* Card Wrapper */
.card-wrapper {
  padding: var(--space-lg) 0;
  display: flex;
  justify-content: center;
}

.personality-card {
  width: 320px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  position: relative;
  box-shadow: var(--shadow-xl);
}

.card-bg-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.1;
  background-image: radial-gradient(circle at 20% 80%, white 1px, transparent 1px),
                    radial-gradient(circle at 80% 20%, white 1px, transparent 1px);
  background-size: 30px 30px;
}

/* Card Themes */
.personality-card.cosmic {
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  color: white;
}

.personality-card.sunrise {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.personality-card.ocean {
  background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%);
  color: white;
}

.personality-card.forest {
  background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
  color: white;
}

.card-content {
  position: relative;
  z-index: 1;
  padding: 28px 24px;
}

.card-top {
  text-align: center;
  margin-bottom: 20px;
}

.card-badge {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  opacity: 0.6;
  margin-bottom: 8px;
}

.card-motto {
  font-size: 1.1rem;
  font-weight: 600;
}

.card-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.card-avatar {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-lg);
  object-fit: contain;
  margin-bottom: 12px;
  background: rgba(255,255,255,0.15);
  padding: 8px;
}

.card-type-info {
  text-align: center;
}

.card-type {
  display: block;
  font-size: 2.2rem;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.card-name {
  display: block;
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 4px;
}

/* Functions Bars */
.card-functions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.card-func {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.card-func-bar {
  height: 6px;
  background: rgba(255,255,255,0.3);
  border-radius: 3px;
  transition: width 1s ease-out;
}

.card-func-code {
  font-weight: 800;
  font-size: 0.9rem;
  min-width: 24px;
}

.card-func-label {
  font-size: 0.7rem;
  opacity: 0.6;
}

/* Tags */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-bottom: 20px;
}

.card-tag {
  font-size: 0.7rem;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(4px);
}

/* Footer */
.card-footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.15);
}

.card-slogan {
  display: block;
  font-size: 0.8rem;
  font-style: italic;
  opacity: 0.8;
  margin-bottom: 8px;
  line-height: 1.5;
}

.card-cta {
  font-size: 0.65rem;
  opacity: 0.5;
}

/* Theme Selector */
.theme-section {
  margin: var(--space-lg) 0;
}

.theme-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: var(--space-md);
  text-align: center;
}

.theme-options {
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
}

.theme-btn {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  border: 3px solid transparent;
  cursor: pointer;
  transition: all var(--transition-normal);
  font-size: 0.7rem;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-btn.active {
  border-color: var(--color-primary);
  transform: scale(1.1);
  box-shadow: var(--shadow-lg);
}

/* Actions */
.card-actions {
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
  min-width: 260px;
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

.btn-secondary-solid {
  background: var(--color-bg-card);
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  min-width: 260px;
}

.btn-secondary-solid:hover {
  background: var(--color-primary-50);
}

.btn-outline {
  padding: 12px 24px;
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: 0.9rem;
}

.btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
