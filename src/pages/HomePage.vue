<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>
      
      <div class="hero-content">
        <div class="logo-mark">🧠</div>
        <h1 class="hero-title">
          <span class="title-line">MBTI</span>
          <span class="title-line accent">Match</span>
        </h1>
        <p class="hero-subtitle">基于荣格八维认知功能</p>
        <p class="hero-desc">深度理解自己，读懂每一段关系</p>
        
        <div class="hero-actions">
          <button class="btn btn-primary btn-lg" @click="goToTest('single')">
            <span class="btn-icon">✨</span>
            探索我的人格
          </button>
          <button class="btn btn-secondary btn-lg" @click="goToTest('dual')">
            <span class="btn-icon">💕</span>
            测测我们的关系
          </button>
        </div>

        <div class="hero-stats" v-if="myType">
          <div class="my-type-badge" @click="goToCard">
            <span class="badge-label">我的类型</span>
            <span class="badge-type">{{ myType }}</span>
            <span class="badge-name">{{ typeName }}</span>
            <span class="badge-action">查看名片 →</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">不只是四个字母</h2>
        <p class="section-desc">深入荣格八维认知功能，揭示你人格深处的秘密</p>
        
        <div class="feature-cards">
          <div class="feature-card" v-for="(feature, i) in features" :key="i">
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Eight Functions Preview -->
    <section class="eight-functions">
      <div class="container">
        <h2 class="section-title">八维认知功能</h2>
        <p class="section-desc">每种人格类型拥有独特的八维功能栈</p>
        
        <div class="functions-preview">
          <div 
            class="func-pill"
            v-for="(func, i) in functionPreview" 
            :key="i"
            :style="{ '--delay': i * 0.1 + 's', '--color': func.color }"
          >
            <span class="func-pos">{{ func.pos }}</span>
            <span class="func-code">{{ func.code }}</span>
            <span class="func-label">{{ func.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Relationship Types -->
    <section class="relationships">
      <div class="container">
        <h2 class="section-title">15种关系类型</h2>
        <p class="section-desc">每段关系都有独特的化学反应</p>
        
        <div class="relation-grid">
          <div 
            class="relation-chip"
            v-for="(rel, i) in relationTypes" 
            :key="i"
            :style="{ '--delay': i * 0.05 + 's' }"
          >
            {{ rel }}
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <div class="cta-card">
          <h2>准备好了解真实的自己吗？</h2>
          <p>只需30秒，选择你的MBTI类型，获得专属的八维认知功能分析</p>
          <button class="btn btn-primary btn-lg" @click="goToTest('single')">
            开始探索 →
          </button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p>MBTI Match · 基于荣格认知功能理论</p>
        <p class="footer-sub">理解自己，理解关系，理解世界</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMbtiStore } from '@/stores/mbti'

const router = useRouter()
const store = useMbtiStore()

const myType = computed(() => store.myType)
const typeName = computed(() => store.getTypeInfo(store.myType)?.name || '')

const features = [
  { icon: '🧬', title: '八维认知功能', desc: '不止INFP四个字母——深入Hero、Parent、Child、Inferior、Nemesis、Critic、Trickster、Demon八个功能位' },
  { icon: '⚗️', title: '关系化学反应', desc: '15种关系类型 × 认知功能碰撞分析，揭示你和TA关系的深层密码' },
  { icon: '🎭', title: '阴影功能解读', desc: '第5-8功能位的阴影解析——那些你不了解的自己，才是成长的关键' },
  { icon: '💌', title: '人格名片', desc: '生成专属人格名片，展示你的认知功能全景图' }
]

const functionPreview = [
  { pos: '①', code: 'Fi', label: '主导·英雄', color: 'var(--cf-dominant)' },
  { pos: '②', code: 'Ne', label: '辅助·父母', color: 'var(--cf-auxiliary)' },
  { pos: '③', code: 'Si', label: '第三·小孩', color: 'var(--cf-tertiary)' },
  { pos: '④', code: 'Te', label: '劣势·弱点', color: 'var(--cf-inferior)' },
  { pos: '⑤', code: 'Fe', label: '对立·宿敌', color: 'var(--cf-opposing)' },
  { pos: '⑥', code: 'Ni', label: '批判·审判', color: 'var(--cf-critical)' },
  { pos: '⑦', code: 'Se', label: '欺骗·盲区', color: 'var(--cf-deceiving)' },
  { pos: '⑧', code: 'Ti', label: '魔鬼·阴暗', color: 'var(--cf-demonic)' }
]

const relationTypes = [
  '本体', '衬托', '陪伴', '顾问', '伙伴', '同族', '老师', '对比',
  '对手', '邻居', '陌生', '室友', '互补', '新奇', '全反', '支持'
]

const goToTest = (mode) => {
  router.push({ path: '/test', query: { mode } })
}

const goToCard = () => {
  router.push({ path: '/card', query: { type: store.myType } })
}
</script>

<style scoped>
.home-page {
  overflow-x: hidden;
}

/* Hero */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl) var(--space-md);
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: float 8s ease-in-out infinite;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: #6366f1;
  top: 10%;
  left: -10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 250px;
  height: 250px;
  background: #ec4899;
  top: 50%;
  right: -5%;
  animation-delay: -3s;
}

.orb-3 {
  width: 200px;
  height: 200px;
  background: #06b6d4;
  bottom: 10%;
  left: 20%;
  animation-delay: -5s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.05); }
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  max-width: 480px;
}

.logo-mark {
  font-size: 64px;
  margin-bottom: var(--space-md);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: var(--space-md);
  letter-spacing: -0.02em;
}

.title-line {
  display: block;
}

.title-line.accent {
  background: linear-gradient(135deg, #818cf8, #c084fc, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.1rem;
  opacity: 0.8;
  font-weight: 500;
  margin-bottom: var(--space-xs);
}

.hero-desc {
  font-size: 1.25rem;
  opacity: 0.9;
  font-weight: 300;
  margin-bottom: var(--space-2xl);
}

.hero-actions {
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
  font-size: 1rem;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
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

.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1.2em;
}

/* My Type Badge */
.hero-stats {
  margin-top: var(--space-2xl);
}

.my-type-badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
  padding: var(--space-md) var(--space-xl);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.my-type-badge:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.badge-label {
  font-size: 0.75rem;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.badge-type {
  font-size: 1.5rem;
  font-weight: 800;
}

.badge-name {
  font-size: 0.9rem;
  opacity: 0.8;
}

.badge-action {
  font-size: 0.8rem;
  color: var(--color-primary-light);
  margin-top: 4px;
}

/* Features */
.features {
  padding: var(--space-3xl) 0;
}

.section-title {
  text-align: center;
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: var(--space-sm);
  color: var(--color-text-primary);
}

.section-desc {
  text-align: center;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xl);
  font-size: 0.95rem;
}

.feature-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.feature-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  transition: all var(--transition-normal);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: var(--space-sm);
}

.feature-title {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: var(--space-xs);
  color: var(--color-text-primary);
}

.feature-desc {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* Eight Functions */
.eight-functions {
  padding: var(--space-2xl) 0;
  background: linear-gradient(180deg, var(--color-bg) 0%, var(--color-primary-50) 100%);
}

.functions-preview {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-width: 360px;
  margin: 0 auto;
}

.func-pill {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: 12px 20px;
  background: var(--color-bg-card);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  transition: all var(--transition-normal);
  animation: fadeInUp 0.5s ease-out both;
  animation-delay: var(--delay);
}

.func-pill:hover {
  transform: translateX(8px);
  box-shadow: var(--shadow-md);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.func-pos {
  font-size: 1.2rem;
  color: var(--color);
}

.func-code {
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--color);
  min-width: 28px;
}

.func-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

/* Relationships */
.relationships {
  padding: var(--space-2xl) 0;
}

.relation-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  justify-content: center;
}

.relation-chip {
  padding: 8px 18px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: all var(--transition-normal);
  cursor: default;
}

.relation-chip:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  transform: scale(1.05);
}

/* CTA */
.cta {
  padding: var(--space-2xl) 0;
}

.cta-card {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl) var(--space-lg);
  text-align: center;
  color: white;
}

.cta-card h2 {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: var(--space-sm);
}

.cta-card p {
  opacity: 0.9;
  margin-bottom: var(--space-lg);
  font-size: 0.95rem;
}

.cta-card .btn-primary {
  background: white;
  color: var(--color-primary);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.cta-card .btn-primary:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

/* Footer */
.footer {
  padding: var(--space-xl) 0;
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: 0.85rem;
}

.footer-sub {
  font-size: 0.75rem;
  margin-top: 4px;
  opacity: 0.7;
}

/* Mobile responsive */
@media (max-width: 480px) {
  .hero-title {
    font-size: 2.8rem;
  }
  
  .hero-desc {
    font-size: 1.1rem;
  }
  
  .btn-lg {
    min-width: 220px;
    padding: 14px 28px;
  }
  
  .feature-cards {
    grid-template-columns: 1fr;
  }
}
</style>
