import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'StudentHome',
    component: () => import('@/views/student/Home.vue'),
    meta: { title: '学生模式首页' }
  },
  {
    path: '/student/practice',
    name: 'StudentPractice',
    component: () => import('@/views/student/Practice.vue'),
    meta: { title: '答题界面' }
  },
  {
    path: '/parent',
    name: 'ParentHome',
    component: () => import('@/views/parent/Home.vue'),
    meta: { title: '家长模式首页', requiresAuth: true }
  },
  {
    path: '/parent/questions',
    name: 'ParentQuestions',
    component: () => import('@/views/parent/Questions.vue'),
    meta: { title: '题目管理', requiresAuth: true }
  },
  {
    path: '/parent/types',
    name: 'ParentTypes',
    component: () => import('@/views/parent/Types.vue'),
    meta: { title: '类型管理', requiresAuth: true }
  },
  {
    path: '/parent/ai-config',
    name: 'ParentAIConfig',
    component: () => import('@/views/parent/AIConfig.vue'),
    meta: { title: 'AI配置', requiresAuth: true }
  },
  {
    path: '/parent/ai-generate',
    name: 'ParentAIGenerate',
    component: () => import('@/views/parent/AIGenerate.vue'),
    meta: { title: 'AI出题', requiresAuth: true }
  },
  {
    path: '/parent/ai-analysis',
    name: 'ParentAIAnalysis',
    component: () => import('@/views/parent/AIAnalysis.vue'),
    meta: { title: '错题分析', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

export default router
