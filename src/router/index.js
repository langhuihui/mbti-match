import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('@/pages/LandingPage.vue')
  },
  {
    path: '/test',
    name: 'Test',
    component: () => import('@/pages/TestPage.vue')
  },
  {
    path: '/result',
    name: 'Result',
    component: () => import('@/pages/ResultPage.vue')
  },
  {
    path: '/card',
    name: 'PersonalityCard',
    component: () => import('@/pages/CardPage.vue')
  },
  {
    path: '/invite',
    name: 'Invite',
    component: () => import('@/pages/InvitePage.vue')
  },
  {
    path: '/match/:code',
    name: 'Match',
    component: () => import('@/pages/MatchPage.vue')
  },
  {
    path: '/types/:type',
    name: 'TypeDetail',
    component: () => import('@/pages/LandingPage.vue') // 占位，后续做SEO优化
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
