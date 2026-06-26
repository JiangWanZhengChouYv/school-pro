import { createRouter, createWebHashHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/StudentLayout.vue'),
    children: [
      {
        path: '',
        name: 'StudentHome',
        component: () => import('@/views/student/Home.vue'),
        meta: { title: '学生模式首页' }
      },
      {
        path: 'student/practice',
        name: 'StudentPractice',
        component: () => import('@/views/student/Practice.vue'),
        meta: { title: '答题界面' }
      },
      {
        path: 'student/wrong-book',
        name: 'StudentWrongBook',
        component: () => import('@/views/student/WrongBook.vue'),
        meta: { title: '错题本' }
      },
      {
        path: 'student/stats',
        name: 'StudentStats',
        component: () => import('@/views/student/Stats.vue'),
        meta: { title: '我的成绩' }
      }
    ]
  },
  {
    path: '/parent',
    component: () => import('@/layouts/ParentLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'ParentHome',
        component: () => import('@/views/parent/Home.vue'),
        meta: { title: '家长模式首页', requiresAuth: true }
      },
      {
        path: 'questions',
        name: 'ParentQuestions',
        component: () => import('@/views/parent/Questions.vue'),
        meta: { title: '题目管理', requiresAuth: true }
      },
      {
        path: 'types',
        name: 'ParentTypes',
        component: () => import('@/views/parent/Types.vue'),
        meta: { title: '类型管理', requiresAuth: true }
      },
      {
        path: 'ai-config',
        name: 'ParentAIConfig',
        component: () => import('@/views/parent/AIConfig.vue'),
        meta: { title: 'AI配置', requiresAuth: true }
      },
      {
        path: 'ai-generate',
        name: 'ParentAIGenerate',
        component: () => import('@/views/parent/AIGenerate.vue'),
        meta: { title: 'AI出题', requiresAuth: true }
      },
      {
        path: 'ai-analysis',
        name: 'ParentAIAnalysis',
        component: () => import('@/views/parent/AIAnalysis.vue'),
        meta: { title: '错题分析', requiresAuth: true }
      }
    ]
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

  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()
    if (!authStore.checkAuth()) {
      ElMessage.warning('请先登录家长模式')
      next({ path: '/' })
      return
    }
  }

  next()
})

export default router
