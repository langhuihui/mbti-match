import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/pages/Dashboard.vue'),
        meta: { title: '数据概览', icon: 'Odometer' },
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/pages/Users.vue'),
        meta: { title: '用户管理', icon: 'User' },
      },
      {
        path: 'users/:id',
        name: 'UserDetail',
        component: () => import('@/pages/UserDetail.vue'),
        meta: { title: '用户详情', hidden: true },
      },
      {
        path: 'assessments',
        name: 'Assessments',
        component: () => import('@/pages/Assessments.vue'),
        meta: { title: '测定记录', icon: 'Document' },
      },
      {
        path: 'assessments/:id',
        name: 'AssessmentDetail',
        component: () => import('@/pages/AssessmentDetail.vue'),
        meta: { title: '测定详情', hidden: true },
      },
      {
        path: 'relations',
        name: 'Relations',
        component: () => import('@/pages/Relations.vue'),
        meta: { title: '关系报告', icon: 'Connection' },
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/pages/Analytics.vue'),
        meta: { title: '数据分析', icon: 'TrendCharts' },
      },
      {
        path: 'risk-monitor',
        name: 'RiskMonitor',
        component: () => import('@/pages/RiskMonitor.vue'),
        meta: { title: '风险监控', icon: 'Warning' },
      },
      {
        path: 'content',
        name: 'Content',
        component: () => import('@/pages/Content.vue'),
        meta: { title: '内容管理', icon: 'Reading' },
      },
      {
        path: 'counselors',
        name: 'Counselors',
        component: () => import('@/pages/Counselors.vue'),
        meta: { title: '咨询师管理', icon: 'UserFilled' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
