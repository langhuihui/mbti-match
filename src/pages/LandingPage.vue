<template>
  <div class="landing-page">
    <!-- 顶部导航 -->
    <nav class="nav-bar" :class="{ 'nav-scrolled': isScrolled }">
      <div class="nav-inner">
        <div class="nav-brand">
          <span class="brand-icon">✦</span>
          <span class="brand-text">MBTI Match</span>
        </div>
        <div class="nav-links" :class="{ 'nav-open': navOpen }">
          <a href="#hero" @click="scrollTo('hero')">首页</a>
          <a href="#story" @click="scrollTo('story')">关于</a>
          <a href="#types" @click="scrollTo('types')">16型人格</a>
          <a href="#chemistry" @click="scrollTo('chemistry')">关系化学</a>
          <a href="#viral" @click="scrollTo('viral')">邀友互测</a>
        </div>
        <button class="nav-toggle" @click="navOpen = !navOpen">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>

    <!-- Hero — Hinge 风格的情感驱动首屏 -->
    <section id="hero" class="hero">
      <div class="hero-bg">
        <div class="hero-gradient"></div>
        <!-- 动态粒子背景 -->
        <div class="hero-particles">
          <div 
            v-for="(p, i) in particles" 
            :key="i"
            class="particle"
            :style="p.style"
          ></div>
        </div>
      </div>

      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          基于荣格八维认知功能理论
        </div>
        
        <h1 class="hero-title">
          <span class="title-line">发现你的</span>
          <span class="title-line title-accent">
            <span class="typing-text" ref="typingRef">{{ currentWord }}</span>
            <span class="typing-cursor">|</span>
          </span>
        </h1>
        
        <p class="hero-desc">
          不止 4 个字母 — 深入 8 种认知功能，揭秘真实的你。<br/>
          已有 <strong class="counter-num">{{ animatedCount.toLocaleString() }}</strong> 人完成测试
        </p>

        <div class="hero-actions">
          <a href="#quick-test" class="btn btn-primary btn-lg" @click="scrollTo('quick-test')">
            <span class="btn-icon">⚡</span>
            60秒快速测试
          </a>
          <a href="#chemistry" class="btn btn-ghost btn-lg" @click="scrollTo('chemistry')">
            测试你们的关系化学
          </a>
        </div>

        <!-- App 下载/二维码区域 — Bumble 风格 -->
        <div class="hero-download">
          <div class="qr-card">
            <div class="qr-placeholder">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#f8fafc" rx="8"/>
                <text x="50" y="45" text-anchor="middle" fill="#94a3b8" font-size="10">小程序码</text>
                <text x="50" y="60" text-anchor="middle" fill="#94a3b8" font-size="10">(待替换)</text>
              </svg>
            </div>
            <span class="qr-label">微信扫码 · 完整体验</span>
          </div>
        </div>
      </div>

      <!-- 向下滚动指示器 -->
      <div class="scroll-indicator" @click="scrollTo('story')">
        <div class="scroll-mouse">
          <div class="scroll-wheel"></div>
        </div>
        <span>往下探索</span>
      </div>
    </section>

    <!-- 品牌故事 — Hinge "designed to be deleted" 风格 -->
    <section id="story" class="story-section">
      <div class="section-inner">
        <div class="story-grid">
          <div class="story-text">
            <h2 class="story-headline">
              我们不给你贴标签，<br/>
              <span class="text-accent">我们帮你理解标签背后的认知世界</span>
            </h2>
            <p class="story-body">
              MBTI Match 基于卡尔·荣格的认知功能理论，超越传统四字母分类，
              深入分析每个人独特的八维认知功能栈。我们相信，理解自己的思维模式，
              是建立真实人际连接的第一步。
            </p>
            <div class="story-stats">
              <div class="stat-item">
                <div class="stat-number">8</div>
                <div class="stat-label">认知功能维度</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">16</div>
                <div class="stat-label">人格类型图谱</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">15</div>
                <div class="stat-label">种关系模式</div>
              </div>
            </div>
          </div>
          <div class="story-visual">
            <div class="visual-card card-1">
              <div class="card-type">INFP</div>
              <div class="card-name">调停者</div>
              <div class="card-stack">Fi · Ne · Si · Te</div>
            </div>
            <div class="visual-card card-2">
              <div class="card-type">ENTJ</div>
              <div class="card-name">指挥官</div>
              <div class="card-stack">Te · Ni · Se · Fi</div>
            </div>
            <div class="visual-connector">
              <span class="connector-label">互补关系</span>
              <div class="connector-line"></div>
              <span class="connector-detail">认知功能完美互补</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 核心功能亮点 — 16Personalities 风格分区展示 -->
    <section class="features-section">
      <div class="section-inner">
        <div class="features-header">
          <span class="section-badge">核心功能</span>
          <h2 class="section-title">不只是测试，更是认知探索之旅</h2>
        </div>
        
        <div class="features-showcase">
          <div 
            v-for="(feat, idx) in features" 
            :key="idx"
            class="feature-block"
            :class="{ 'feature-reverse': idx % 2 !== 0 }"
          >
            <div class="feature-content">
              <div class="feature-number">{{ String(idx + 1).padStart(2, '0') }}</div>
              <h3 class="feature-title">{{ feat.title }}</h3>
              <p class="feature-desc">{{ feat.desc }}</p>
              <div class="feature-tags">
                <span v-for="tag in feat.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
            <div class="feature-visual" :class="`visual-${idx}`">
              <div class="feature-demo">
                <span class="demo-icon">{{ feat.icon }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 16种人格类型 — 16Personalities 风格IP展示 -->
    <section id="types" class="types-section">
      <div class="section-inner">
        <div class="types-header">
          <span class="section-badge">人格图鉴</span>
          <h2 class="section-title">16种人格，你是哪一种？</h2>
          <p class="section-subtitle">点击任意类型卡片，探索其认知功能栈</p>
        </div>

        <div class="types-groups">
          <div 
            v-for="group in mbtiGroups" 
            :key="group.name"
            class="type-group"
          >
            <div class="group-label">
              <span class="group-badge" :style="{ '--group-color': group.color }">
                {{ group.badge }}
              </span>
              <span class="group-name">{{ group.name }}</span>
              <span class="group-desc">{{ group.subtitle }}</span>
            </div>
            
            <div class="group-cards">
              <div 
                v-for="typeCode in group.types" 
                :key="typeCode"
                class="type-card"
                :class="{ 'type-expanded': expandedType === typeCode }"
                :style="{ '--group-color': group.color }"
                @click="toggleTypeDetail(typeCode)"
              >
                <div class="type-card-main">
                  <img 
                    :src="MBTI_TYPES[typeCode].image" 
                    :alt="typeCode"
                    class="type-avatar"
                    loading="lazy"
                  />
                  <div class="type-meta">
                    <div class="type-code">{{ typeCode }}</div>
                    <div class="type-name">{{ MBTI_TYPES[typeCode].name }}</div>
                  </div>
                  <div class="type-expand-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                </div>

                <transition name="slide-expand">
                  <div v-if="expandedType === typeCode" class="type-card-detail" @click.stop>
                    <div class="detail-stack">
                      <div 
                        v-for="(func, fIdx) in MBTI_TYPES[typeCode].functions.slice(0, 4)" 
                        :key="fIdx"
                        class="stack-item"
                        :class="`pos-${fIdx}`"
                      >
                        <span class="stack-pos">{{ ['主导', '辅助', '第三', '劣势'][fIdx] }}</span>
                        <span class="stack-func">{{ func }}</span>
                        <span class="stack-label">{{ COGNITIVE_FUNCTION_DESCRIPTIONS[func].name }}</span>
                      </div>
                    </div>
                    <a href="#chemistry" class="detail-cta" @click="selectTypeForChemistry(typeCode)">
                      测试 {{ typeCode }} 的关系化学 →
                    </a>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 关系化学实验室 — 互动裂变核心模块 -->
    <section id="chemistry" class="chemistry-section">
      <div class="section-inner">
        <div class="chemistry-header">
          <span class="section-badge">关系化学</span>
          <h2 class="section-title">你和 TA 的认知碰撞</h2>
          <p class="section-subtitle">选择两种人格类型，揭秘你们之间的关系模式</p>
        </div>

        <div class="chemistry-lab">
          <div class="lab-selectors">
            <div class="lab-person">
              <label>我的类型</label>
              <div class="type-pill-select">
                <button 
                  v-for="tc in MBTI_TYPE_ORDER" 
                  :key="tc + '1'"
                  class="pill" 
                  :class="{ 'pill-active': selectedType1 === tc }"
                  @click="selectedType1 = tc"
                >
                  {{ tc }}
                </button>
              </div>
            </div>

            <div class="lab-divider">
              <div class="divider-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="15" stroke="currentColor" stroke-width="1"/>
                  <path d="M10 16H22M22 16L17 11M22 16L17 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>

            <div class="lab-person">
              <label>TA 的类型</label>
              <div class="type-pill-select">
                <button 
                  v-for="tc in MBTI_TYPE_ORDER" 
                  :key="tc + '2'"
                  class="pill" 
                  :class="{ 'pill-active': selectedType2 === tc }"
                  @click="selectedType2 = tc"
                >
                  {{ tc }}
                </button>
              </div>
            </div>
          </div>

          <transition name="result-reveal">
            <div v-if="relationResult" class="lab-result">
              <div class="result-card">
                <div class="result-types">
                  <span class="result-type">{{ selectedType1 }}</span>
                  <span class="result-connector">×</span>
                  <span class="result-type">{{ selectedType2 }}</span>
                </div>
                <div class="result-relation">
                  <div class="result-badge">{{ relationResult }}</div>
                </div>
                <p class="result-desc">{{ RELATIONSHIP_DESCRIPTIONS[relationResult] }}</p>
                
                <!-- 裂变CTA：分享结果 -->
                <div class="result-share">
                  <button class="btn btn-share" @click="shareResult">
                    <span>📤</span> 分享给 TA 看看
                  </button>
                  <button class="btn btn-invite" @click="scrollTo('viral')">
                    <span>🔗</span> 邀请 TA 一起测
                  </button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </section>

    <!-- 裂变增长模块 — 参考 Dropbox/Morning Brew 裂变机制 -->
    <section id="viral" class="viral-section">
      <div class="section-inner">
        <div class="viral-header">
          <span class="section-badge badge-highlight">🔥 社交裂变</span>
          <h2 class="section-title">邀好友，解锁隐藏内容</h2>
          <p class="section-subtitle">每成功邀请一位好友完成测试，解锁更多专属内容</p>
        </div>

        <div class="viral-tiers">
          <div 
            v-for="(tier, idx) in viralTiers" 
            :key="idx"
            class="tier-card"
            :class="{ 'tier-locked': tier.locked }"
          >
            <div class="tier-badge" :style="{ '--tier-color': tier.color }">
              {{ tier.icon }}
            </div>
            <div class="tier-info">
              <h4 class="tier-title">{{ tier.title }}</h4>
              <p class="tier-desc">{{ tier.desc }}</p>
            </div>
            <div class="tier-req">
              <span class="tier-count">{{ tier.friends }}</span>
              <span class="tier-label">位好友</span>
            </div>
            <div v-if="tier.locked" class="tier-lock">🔒</div>
          </div>
        </div>

        <!-- 快速邀请入口 -->
        <div class="viral-invite">
          <div class="invite-card">
            <h3>把你的人格密码分享给朋友</h3>
            <p>好友扫码或输入邀请码即可参与匹配</p>
            <div class="invite-actions">
              <div class="invite-qr">
                <div class="qr-placeholder small">
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <rect width="80" height="80" fill="#f1f5f9" rx="8"/>
                    <text x="40" y="38" text-anchor="middle" fill="#94a3b8" font-size="9">小程序码</text>
                    <text x="40" y="50" text-anchor="middle" fill="#94a3b8" font-size="9">(待替换)</text>
                  </svg>
                </div>
              </div>
              <div class="invite-methods">
                <button class="method-btn wechat">
                  <span>💬</span> 微信分享
                </button>
                <button class="method-btn link" @click="copyLink">
                  <span>🔗</span> 复制链接
                </button>
                <button class="method-btn poster">
                  <span>🖼️</span> 生成海报
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 快速测试入口 — 参考 16Personalities 的低门槛设计 -->
    <section id="quick-test" class="quicktest-section">
      <div class="section-inner">
        <div class="quicktest-card">
          <div class="quicktest-content">
            <h2 class="quicktest-title">60 秒认知功能快测</h2>
            <p class="quicktest-desc">
              回答几个关键问题，快速了解你的主导认知功能。<br/>
              完整版测试请前往小程序体验。
            </p>

            <!-- 简版内嵌测试 -->
            <div v-if="!quickTestResult" class="quicktest-flow">
              <div class="test-progress">
                <div class="progress-bar" :style="{ width: `${(currentQ + 1) / quickQuestions.length * 100}%` }"></div>
                <span class="progress-text">{{ currentQ + 1 }} / {{ quickQuestions.length }}</span>
              </div>

              <div class="test-question">
                <p class="question-text">{{ quickQuestions[currentQ].q }}</p>
                <div class="question-options">
                  <button 
                    v-for="(opt, oi) in quickQuestions[currentQ].options" 
                    :key="oi"
                    class="option-btn"
                    @click="answerQuestion(oi)"
                  >
                    {{ opt.text }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 快测结果 -->
            <div v-else class="quicktest-result">
              <div class="qresult-type">{{ quickTestResult }}</div>
              <div class="qresult-name">{{ MBTI_TYPES[quickTestResult]?.name || '未知' }}</div>
              <p class="qresult-hint">这只是简版推测，前往小程序体验完整深度测试 →</p>
              <div class="qresult-actions">
                <button class="btn btn-primary" @click="resetQuickTest">重新测试</button>
                <button class="btn btn-share" @click="shareQuickResult">分享结果给好友</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 用户故事 — Bumble 风格的社会证明 -->
    <section class="stories-section">
      <div class="section-inner">
        <div class="stories-header">
          <span class="section-badge">真实故事</span>
          <h2 class="section-title">他们通过人格测试发现了什么</h2>
        </div>

        <div class="stories-grid">
          <div 
            v-for="(story, idx) in userStories" 
            :key="idx"
            class="story-card"
          >
            <div class="story-quote">"{{ story.quote }}"</div>
            <div class="story-author">
              <div class="author-avatar" :style="{ background: story.color }">
                {{ story.type.slice(0, 2) }}
              </div>
              <div class="author-info">
                <span class="author-name">{{ story.name }}</span>
                <span class="author-type">{{ story.type }} · {{ MBTI_TYPES[story.type]?.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 底部 CTA — 全页最终转化 -->
    <section class="final-cta">
      <div class="section-inner">
        <div class="cta-card">
          <h2>准备好探索你的认知世界了吗？</h2>
          <p>微信扫码，开启你的人格探索之旅</p>
          <div class="cta-qr">
            <div class="qr-placeholder large">
              <svg width="180" height="180" viewBox="0 0 180 180">
                <rect width="180" height="180" fill="white" rx="12"/>
                <text x="90" y="80" text-anchor="middle" fill="#94a3b8" font-size="12">小程序码</text>
                <text x="90" y="100" text-anchor="middle" fill="#94a3b8" font-size="12">(待替换)</text>
              </svg>
            </div>
          </div>
          <div class="cta-badges">
            <span class="cta-badge">🔒 数据安全</span>
            <span class="cta-badge">⚡ 免费使用</span>
            <span class="cta-badge">🧠 科学算法</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-main">
          <div class="footer-brand">
            <span class="brand-icon">✦</span>
            <span class="brand-text">MBTI Match</span>
            <p class="footer-tagline">探索认知世界，发现真实连接</p>
          </div>
          <div class="footer-links">
            <div class="link-group">
              <h4>探索</h4>
              <a href="#types">16型人格</a>
              <a href="#chemistry">关系化学</a>
              <a href="#quick-test">快速测试</a>
            </div>
            <div class="link-group">
              <h4>关于</h4>
              <a href="#story">品牌故事</a>
              <a href="#">隐私政策</a>
              <a href="#">使用条款</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© {{ new Date().getFullYear() }} MBTI Match · 基于荣格认知功能理论</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  MBTI_TYPES, 
  MBTI_TYPE_ORDER, 
  COGNITIVE_FUNCTION_DESCRIPTIONS,
  RELATIONSHIP_DESCRIPTIONS 
} from '@/data/constants.js'
import { getMbtiRelation } from '@/utils/mbtiRelations.js'

// ========================================
// 导航逻辑
// ========================================
const isScrolled = ref(false)
const navOpen = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const scrollTo = (id) => {
  navOpen.value = false
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

// ========================================
// Hero 动效
// ========================================
const words = ['认知密码', '思维模式', '关系化学', '人格深度']
const currentWordIndex = ref(0)
const currentWord = ref(words[0])
const typingRef = ref(null)

let wordInterval
const cycleWords = () => {
  wordInterval = setInterval(() => {
    currentWordIndex.value = (currentWordIndex.value + 1) % words.length
    currentWord.value = words[currentWordIndex.value]
  }, 2500)
}

// 动态计数器
const animatedCount = ref(0)
const targetCount = 12847
let countInterval

const animateCount = () => {
  const duration = 2000
  const steps = 60
  const increment = targetCount / steps
  let current = 0
  countInterval = setInterval(() => {
    current += increment
    if (current >= targetCount) {
      animatedCount.value = targetCount
      clearInterval(countInterval)
    } else {
      animatedCount.value = Math.floor(current)
    }
  }, duration / steps)
}

// 粒子背景
const particles = Array.from({ length: 20 }, (_, i) => ({
  style: {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    width: `${Math.random() * 4 + 2}px`,
    height: `${Math.random() * 4 + 2}px`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${3 + Math.random() * 4}s`,
    opacity: Math.random() * 0.5 + 0.1
  }
}))

// ========================================
// 功能特性
// ========================================
const features = [
  {
    icon: '🧠',
    title: '八维认知功能深度解析',
    desc: '超越传统四字母分类，深入分析 Se/Si/Ne/Ni/Te/Ti/Fe/Fi 八种认知功能在你身上的排列组合，精确定位你的思维偏好。',
    tags: ['荣格理论', '8维分析', '个性化报告']
  },
  {
    icon: '⚗️',
    title: '关系化学配对算法',
    desc: '独创的关系判定算法，基于认知功能栈的互动模式分析，揭秘 15 种不同关系类型，找到你们之间的认知碰撞点。',
    tags: ['15种关系', '配对分析', '互动建议']
  },
  {
    icon: '🎴',
    title: '人格名片 · 社交新货币',
    desc: '精美的人格展示卡片，一键生成带有你认知功能栈的专属名片。多种主题风格，让人格成为你的社交名片。',
    tags: ['6款主题', '一键生成', '朋友圈晒图']
  },
  {
    icon: '🔗',
    title: '双人匹配 · 邀请码机制',
    desc: '生成专属邀请码，好友输入后即刻揭晓你们的关系模式。沉浸式匹配结果展示，让每次社交互动都充满期待。',
    tags: ['邀请码', '实时匹配', '关系揭秘']
  }
]

// ========================================
// MBTI 族群
// ========================================
const mbtiGroups = [
  {
    name: '分析家',
    badge: 'NT',
    subtitle: '理性的战略家',
    color: '#8b5cf6',
    types: ['INTJ', 'INTP', 'ENTJ', 'ENTP']
  },
  {
    name: '外交家',
    badge: 'NF',
    subtitle: '共情的理想主义者',
    color: '#10b981',
    types: ['INFJ', 'INFP', 'ENFJ', 'ENFP']
  },
  {
    name: '守护者',
    badge: 'SJ',
    subtitle: '务实的组织者',
    color: '#0ea5e9',
    types: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ']
  },
  {
    name: '探索者',
    badge: 'SP',
    subtitle: '灵活的实干家',
    color: '#f59e0b',
    types: ['ISTP', 'ISFP', 'ESTP', 'ESFP']
  }
]

// ========================================
// 类型展开
// ========================================
const expandedType = ref(null)

const toggleTypeDetail = (typeCode) => {
  expandedType.value = expandedType.value === typeCode ? null : typeCode
}

// ========================================
// 关系化学实验室
// ========================================
const selectedType1 = ref('')
const selectedType2 = ref('')

const relationResult = computed(() => {
  if (selectedType1.value && selectedType2.value) {
    try {
      return getMbtiRelation(selectedType1.value, selectedType2.value)
    } catch {
      return null
    }
  }
  return null
})

const selectTypeForChemistry = (typeCode) => {
  if (!selectedType1.value) {
    selectedType1.value = typeCode
  } else {
    selectedType2.value = typeCode
  }
  scrollTo('chemistry')
}

// ========================================
// 裂变层级
// ========================================
const viralTiers = [
  { icon: '🌱', title: '新手探索', desc: '获得基础人格报告', friends: 0, color: '#10b981', locked: false },
  { icon: '⭐', title: '深度解读', desc: '解锁完整认知功能分析 + 个性化建议', friends: 1, color: '#3b82f6', locked: true },
  { icon: '💎', title: '关系大师', desc: '解锁所有关系类型详解 + 互动攻略', friends: 3, color: '#8b5cf6', locked: true },
  { icon: '👑', title: '人格专家', desc: '专属高级名片主题 + 隐藏彩蛋功能', friends: 5, color: '#f59e0b', locked: true }
]

// ========================================
// 快速测试
// ========================================
const quickQuestions = [
  {
    q: '周末你更倾向于？',
    options: [
      { text: '独处充电，看书或追剧', dim: 'I' },
      { text: '约朋友出去聚会玩耍', dim: 'E' }
    ]
  },
  {
    q: '做决定时你更依赖？',
    options: [
      { text: '直觉和感受，这样做感觉对不对', dim: 'F' },
      { text: '逻辑和分析，这样做合不合理', dim: 'T' }
    ]
  },
  {
    q: '面对新项目你更倾向？',
    options: [
      { text: '先想象各种可能性和大方向', dim: 'N' },
      { text: '先了解现有的事实和细节', dim: 'S' }
    ]
  },
  {
    q: '你的工作方式更接近？',
    options: [
      { text: '列计划，按步骤推进，喜欢确定性', dim: 'J' },
      { text: '灵活应变，保持选项开放，不喜欢被限制', dim: 'P' }
    ]
  },
  {
    q: '与人冲突时你倾向于？',
    options: [
      { text: '先考虑对方的感受和关系和谐', dim: 'Fe' },
      { text: '先坚持自己的原则和内心判断', dim: 'Fi' }
    ]
  },
  {
    q: '你更擅长？',
    options: [
      { text: '看到事物深层的联系和未来趋势', dim: 'Ni' },
      { text: '发散出很多新奇的想法和可能性', dim: 'Ne' }
    ]
  }
]

const currentQ = ref(0)
const answers = ref([])
const quickTestResult = ref(null)

const answerQuestion = (optionIndex) => {
  answers.value.push(quickQuestions[currentQ.value].options[optionIndex].dim)
  if (currentQ.value < quickQuestions.length - 1) {
    currentQ.value++
  } else {
    calculateQuickResult()
  }
}

const calculateQuickResult = () => {
  const dims = answers.value
  const ie = dims.includes('I') ? 'I' : 'E'
  const ns = dims.includes('N') ? 'N' : 'S'
  const tf = dims.includes('T') ? 'T' : (dims.includes('F') ? 'F' : (dims.includes('Fi') ? 'F' : 'T'))
  const jp = dims.includes('J') ? 'J' : 'P'
  quickTestResult.value = `${ie}${ns}${tf}${jp}`
}

const resetQuickTest = () => {
  currentQ.value = 0
  answers.value = []
  quickTestResult.value = null
}

// ========================================
// 用户故事（社会证明）
// ========================================
const userStories = [
  {
    quote: '以前总觉得自己很矛盾，看了认知功能分析才明白，原来 Fi-Ne 就是这样运作的。突然觉得自己被理解了。',
    name: '小鹿',
    type: 'INFP',
    color: '#10b981'
  },
  {
    quote: '和男朋友用了关系匹配功能，发现我们是"互补"关系。他的 Te 正好弥补了我的弱项，终于知道为什么跟他在一起这么安心了。',
    name: 'Coco',
    type: 'INFJ',
    color: '#8b5cf6'
  },
  {
    quote: '把人格名片发到朋友圈，引发了一场 MBTI 大讨论。现在整个宿舍都在研究认知功能，太有趣了。',
    name: '阿东',
    type: 'ENTP',
    color: '#f59e0b'
  }
]

// ========================================
// 分享功能
// ========================================
const shareResult = () => {
  const text = `我和TA（${selectedType1.value} × ${selectedType2.value}）的关系是：${relationResult.value}！来测测你们的关系化学 👉`
  if (navigator.share) {
    navigator.share({ title: 'MBTI Match 关系化学', text })
  } else {
    navigator.clipboard?.writeText(text)
    alert('结果已复制到剪贴板！')
  }
}

const shareQuickResult = () => {
  const text = `我刚测出来是 ${quickTestResult.value}（${MBTI_TYPES[quickTestResult.value]?.name}），你呢？来测测 👉`
  if (navigator.share) {
    navigator.share({ title: 'MBTI Match 快速测试', text })
  } else {
    navigator.clipboard?.writeText(text)
    alert('结果已复制到剪贴板！')
  }
}

const copyLink = () => {
  navigator.clipboard?.writeText(window.location.href)
  alert('链接已复制！')
}

// ========================================
// 生命周期
// ========================================
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  cycleWords()
  animateCount()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  clearInterval(wordInterval)
  clearInterval(countInterval)
})
</script>

<style scoped>
/* ========================================
   Global Section Styles
   ======================================== */
.landing-page {
  min-height: 100vh;
  background: #fafbfc;
  overflow-x: hidden;
}

.section-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 24px;
}

.section-badge {
  display: inline-block;
  padding: 6px 16px;
  background: var(--color-primary-50);
  color: var(--color-primary);
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
}

.badge-highlight {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
}

.section-title {
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 800;
  color: var(--color-text-primary);
  line-height: 1.3;
  margin-bottom: 12px;
}

.section-subtitle {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  max-width: 520px;
}

/* ========================================
   Navigation
   ======================================== */
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 16px 0;
  transition: all 0.3s ease;
}

.nav-scrolled {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 10px 0;
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 1.2rem;
  color: #fff;
  transition: color 0.3s;
}

.nav-scrolled .nav-brand {
  color: var(--color-text-primary);
}

.brand-icon {
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-links a {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
  white-space: nowrap;
}

.nav-scrolled .nav-links a {
  color: var(--color-text-secondary);
}

.nav-links a:hover {
  color: #fff;
}

.nav-scrolled .nav-links a:hover {
  color: var(--color-primary);
}

.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.nav-toggle span {
  width: 20px;
  height: 2px;
  background: #fff;
  border-radius: 2px;
  transition: background 0.3s;
}

.nav-scrolled .nav-toggle span {
  background: var(--color-text-primary);
}

/* ========================================
   Hero Section
   ======================================== */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
}

.hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    #1a1a2e 0%,
    #16213e 30%,
    #0f3460 60%,
    #1a1a2e 100%
  );
}

.hero-gradient::after {
  content: '';
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.25) 0%, transparent 50%),
    radial-gradient(circle at 80% 30%, rgba(139, 92, 246, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 40%);
}

.hero-particles {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: particleFloat 6s ease-in-out infinite;
}

@keyframes particleFloat {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.5); }
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 120px 24px 60px;
  max-width: 720px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 100px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 32px;
  backdrop-filter: blur(10px);
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.5); }
}

.hero-title {
  font-size: clamp(2.5rem, 7vw, 4.5rem);
  font-weight: 900;
  color: #fff;
  line-height: 1.15;
  margin-bottom: 24px;
}

.title-line {
  display: block;
}

.title-accent {
  background: linear-gradient(135deg, #818cf8, #a78bfa, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.typing-cursor {
  -webkit-text-fill-color: #818cf8;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.hero-desc {
  font-size: 1.15rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.7;
  margin-bottom: 40px;
}

.counter-num {
  color: #a78bfa;
  font-weight: 700;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 48px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  text-decoration: none;
  font-size: 0.95rem;
  white-space: nowrap;
}

.btn-lg {
  padding: 16px 32px;
  font-size: 1.05rem;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);
}

.btn-ghost {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-share {
  padding: 12px 24px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  border-radius: 10px;
}

.btn-invite {
  padding: 12px 24px;
  background: var(--color-primary-50);
  color: var(--color-primary);
  border: none;
  border-radius: 10px;
}

.btn-icon {
  font-size: 1.1rem;
}

.hero-download {
  display: flex;
  justify-content: center;
}

.qr-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.qr-placeholder {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.qr-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

/* 滚动指示器 */
.scroll-indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  animation: fadeInUp 1s ease-out 1s both;
}

.scroll-mouse {
  width: 24px;
  height: 36px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  padding-top: 6px;
}

.scroll-wheel {
  width: 3px;
  height: 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 3px;
  animation: scrollDown 2s ease-in-out infinite;
}

@keyframes scrollDown {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(10px); opacity: 0; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translate(-50%, 20px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

/* ========================================
   Story Section
   ======================================== */
.story-section {
  background: #fff;
}

.story-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.story-headline {
  font-size: clamp(1.5rem, 3.5vw, 2.25rem);
  font-weight: 800;
  line-height: 1.4;
  color: var(--color-text-primary);
  margin-bottom: 20px;
}

.text-accent {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.story-body {
  font-size: 1.05rem;
  color: var(--color-text-secondary);
  line-height: 1.8;
  margin-bottom: 40px;
}

.story-stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--color-text-tertiary);
  margin-top: 4px;
}

/* 视觉卡片 */
.story-visual {
  position: relative;
  height: 360px;
}

.visual-card {
  position: absolute;
  width: 200px;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-border);
  text-align: center;
  transition: transform 0.3s ease;
}

.visual-card:hover {
  transform: scale(1.05);
}

.card-1 {
  top: 20px;
  left: 0;
  z-index: 2;
}

.card-2 {
  top: 80px;
  right: 0;
  z-index: 2;
}

.card-type {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-primary);
}

.card-name {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin: 4px 0;
}

.card-stack {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
  font-family: var(--font-mono);
}

.visual-connector {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 1;
}

.connector-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 8px;
}

.connector-line {
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light));
  margin: 0 auto;
  border-radius: 1px;
}

.connector-detail {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  margin-top: 8px;
}

/* ========================================
   Features Section
   ======================================== */
.features-section {
  background: #fafbfc;
}

.features-header {
  text-align: center;
  margin-bottom: 64px;
}

.features-showcase {
  display: flex;
  flex-direction: column;
  gap: 80px;
}

.feature-block {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.feature-block.feature-reverse {
  direction: rtl;
}

.feature-block.feature-reverse > * {
  direction: ltr;
}

.feature-number {
  font-size: 4rem;
  font-weight: 900;
  color: var(--color-primary-50);
  line-height: 1;
  margin-bottom: 12px;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.feature-desc {
  font-size: 1rem;
  color: var(--color-text-secondary);
  line-height: 1.8;
  margin-bottom: 16px;
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 12px;
  background: var(--color-primary-50);
  color: var(--color-primary);
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 500;
}

.feature-visual {
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-demo {
  width: 240px;
  height: 240px;
  background: linear-gradient(135deg, var(--color-primary-50), #ede9fe);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
  transition: transform 0.3s ease;
}

.feature-demo:hover {
  transform: scale(1.05) rotate(3deg);
}

/* ========================================
   Types Section
   ======================================== */
.types-section {
  background: #fff;
}

.types-header {
  text-align: center;
  margin-bottom: 48px;
}

.types-groups {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.type-group {
  /* group wrapper */
}

.group-label {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.group-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--group-color);
  color: #fff;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 700;
}

.group-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.group-desc {
  font-size: 0.85rem;
  color: var(--color-text-tertiary);
}

.group-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.type-card {
  background: #fafbfc;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s ease;
}

.type-card:hover {
  border-color: var(--group-color);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.type-expanded {
  background: #fff;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.type-card-main {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.type-avatar {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  flex-shrink: 0;
}

.type-meta {
  flex: 1;
  min-width: 0;
}

.type-code {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.type-name {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
}

.type-expand-icon {
  color: var(--color-text-tertiary);
  transition: transform 0.25s;
}

.type-expanded .type-expand-icon {
  transform: rotate(180deg);
}

.type-card-detail {
  padding: 0 16px 16px;
}

.detail-stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.stack-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  background: #f8fafc;
  font-size: 0.8rem;
}

.stack-item.pos-0 { border-left: 3px solid var(--cf-dominant); }
.stack-item.pos-1 { border-left: 3px solid var(--cf-auxiliary); }
.stack-item.pos-2 { border-left: 3px solid var(--cf-tertiary); }
.stack-item.pos-3 { border-left: 3px solid var(--cf-inferior); }

.stack-pos {
  font-weight: 600;
  color: var(--color-text-tertiary);
  font-size: 0.7rem;
  min-width: 30px;
}

.stack-func {
  font-weight: 700;
  color: var(--color-text-primary);
  font-family: var(--font-mono);
}

.stack-label {
  color: var(--color-text-secondary);
}

.detail-cta {
  display: block;
  text-align: center;
  padding: 8px;
  color: var(--color-primary);
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: 8px;
  background: var(--color-primary-50);
  transition: background 0.2s;
}

.detail-cta:hover {
  background: var(--color-primary-100);
}

/* Slide expand animation */
.slide-expand-enter-active,
.slide-expand-leave-active {
  transition: all 0.3s ease;
  max-height: 300px;
  overflow: hidden;
}

.slide-expand-enter-from,
.slide-expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

/* ========================================
   Chemistry Section
   ======================================== */
.chemistry-section {
  background: linear-gradient(to bottom, #fafbfc, #f0f0ff);
}

.chemistry-header {
  text-align: center;
  margin-bottom: 48px;
}

.chemistry-lab {
  max-width: 800px;
  margin: 0 auto;
}

.lab-selectors {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.lab-person label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.type-pill-select {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pill {
  padding: 8px 14px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-mono);
}

.pill:hover {
  border-color: var(--color-primary-light);
  color: var(--color-primary);
}

.pill-active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.lab-divider {
  display: flex;
  justify-content: center;
  color: var(--color-text-tertiary);
}

.lab-result {
  margin-top: 40px;
}

.result-card {
  background: #fff;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.result-types {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.result-type {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-primary);
}

.result-connector {
  font-size: 1.5rem;
  color: var(--color-text-tertiary);
}

.result-badge {
  display: inline-block;
  padding: 10px 28px;
  background: linear-gradient(135deg, var(--color-primary), #8b5cf6);
  color: #fff;
  border-radius: 100px;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.result-desc {
  color: var(--color-text-secondary);
  font-size: 1rem;
  line-height: 1.7;
  margin-bottom: 24px;
}

.result-share {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Result reveal animation */
.result-reveal-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.result-reveal-leave-active {
  transition: all 0.3s ease;
}

.result-reveal-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.result-reveal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* ========================================
   Viral Section
   ======================================== */
.viral-section {
  background: #fff;
}

.viral-header {
  text-align: center;
  margin-bottom: 48px;
}

.viral-tiers {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 48px;
}

.tier-card {
  position: relative;
  background: #fafbfc;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  transition: all 0.25s ease;
}

.tier-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.tier-locked {
  opacity: 0.6;
}

.tier-badge {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: color-mix(in srgb, var(--tier-color) 15%, white);
}

.tier-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.tier-desc {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
  line-height: 1.5;
}

.tier-req {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.tier-count {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-primary);
}

.tier-label {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
}

.tier-lock {
  position: absolute;
  top: 12px;
  right: 12px;
}

.viral-invite {
  max-width: 600px;
  margin: 0 auto;
}

.invite-card {
  background: linear-gradient(135deg, #eef2ff, #ede9fe);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
}

.invite-card h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.invite-card p {
  color: var(--color-text-secondary);
  margin-bottom: 24px;
}

.invite-actions {
  display: flex;
  align-items: center;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
}

.invite-methods {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.method-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-text-primary);
}

.method-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.method-btn.wechat:hover {
  border-color: #07c160;
  color: #07c160;
}

/* ========================================
   Quick Test Section
   ======================================== */
.quicktest-section {
  background: linear-gradient(to bottom, #f0f0ff, #fafbfc);
}

.quicktest-card {
  max-width: 640px;
  margin: 0 auto;
  background: #fff;
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
}

.quicktest-title {
  font-size: 1.75rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 12px;
}

.quicktest-desc {
  text-align: center;
  color: var(--color-text-secondary);
  margin-bottom: 36px;
  line-height: 1.7;
}

.test-progress {
  position: relative;
  height: 6px;
  background: var(--color-divider);
  border-radius: 3px;
  margin-bottom: 32px;
  overflow: hidden;
}

.progress-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), #8b5cf6);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  right: 0;
  top: -20px;
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}

.question-text {
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 24px;
  color: var(--color-text-primary);
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-btn {
  padding: 16px 24px;
  border: 2px solid var(--color-border);
  border-radius: 14px;
  background: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  color: var(--color-text-primary);
  font-weight: 500;
}

.option-btn:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-50);
  color: var(--color-primary);
}

/* Quick test result */
.quicktest-result {
  text-align: center;
}

.qresult-type {
  font-size: 3.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
}

.qresult-name {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}

.qresult-hint {
  font-size: 0.9rem;
  color: var(--color-text-tertiary);
  margin-bottom: 24px;
}

.qresult-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

/* ========================================
   Stories Section (Social Proof)
   ======================================== */
.stories-section {
  background: #fff;
}

.stories-header {
  text-align: center;
  margin-bottom: 48px;
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.story-card {
  background: #fafbfc;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 28px;
  transition: all 0.25s ease;
}

.story-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.story-quote {
  font-size: 1rem;
  color: var(--color-text-primary);
  line-height: 1.7;
  margin-bottom: 20px;
  font-style: italic;
}

.story-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 0.75rem;
}

.author-name {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-primary);
}

.author-type {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
}

/* ========================================
   Final CTA
   ======================================== */
.final-cta {
  background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
}

.final-cta .section-inner {
  padding: 80px 24px;
}

.cta-card {
  text-align: center;
  color: #fff;
}

.cta-card h2 {
  font-size: clamp(1.5rem, 3.5vw, 2.25rem);
  font-weight: 800;
  margin-bottom: 12px;
}

.cta-card p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 32px;
}

.cta-qr {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.qr-placeholder.large {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.cta-badges {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-badge {
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
}

/* ========================================
   Footer
   ======================================== */
.site-footer {
  background: #0f172a;
  color: rgba(255, 255, 255, 0.7);
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 24px 24px;
}

.footer-main {
  display: flex;
  justify-content: space-between;
  gap: 48px;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.footer-brand {
  max-width: 300px;
}

.footer-brand .brand-icon,
.footer-brand .brand-text {
  color: #fff;
}

.footer-brand .brand-text {
  font-size: 1.2rem;
  font-weight: 700;
}

.footer-tagline {
  margin-top: 8px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
}

.footer-links {
  display: flex;
  gap: 48px;
}

.link-group h4 {
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.link-group a {
  display: block;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
  text-decoration: none;
  padding: 4px 0;
  transition: color 0.2s;
}

.link-group a:hover {
  color: rgba(255, 255, 255, 0.9);
}

.footer-bottom {
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
}

/* ========================================
   Responsive Design
   ======================================== */
@media (max-width: 1024px) {
  .story-grid {
    grid-template-columns: 1fr;
    gap: 48px;
  }
  
  .story-visual {
    display: none;
  }

  .feature-block,
  .feature-block.feature-reverse {
    grid-template-columns: 1fr;
    direction: ltr;
    gap: 32px;
  }

  .feature-visual {
    order: -1;
  }

  .feature-demo {
    width: 160px;
    height: 160px;
    font-size: 3.5rem;
  }
}

@media (max-width: 768px) {
  .section-inner {
    padding: 60px 16px;
  }

  .nav-links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    flex-direction: column;
    padding: 16px 24px;
    gap: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .nav-open {
    display: flex;
  }

  .nav-open a {
    color: var(--color-text-primary) !important;
  }

  .nav-toggle {
    display: flex;
  }

  .hero-content {
    padding: 100px 16px 60px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .group-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .viral-tiers {
    grid-template-columns: repeat(2, 1fr);
  }

  .stories-grid {
    grid-template-columns: 1fr;
  }

  .quicktest-card {
    padding: 28px 20px;
  }

  .result-card {
    padding: 28px 20px;
  }

  .footer-main {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .group-cards {
    grid-template-columns: 1fr;
  }

  .viral-tiers {
    grid-template-columns: 1fr;
  }

  .invite-actions {
    flex-direction: column;
  }

  .story-stats {
    flex-direction: column;
    gap: 20px;
  }
}
</style>
