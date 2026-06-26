import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './assets/styles/global.scss'
import message from './utils/message'

const app = createApp(App)
const pinia = createPinia()

// Vue 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('[Vue Global Error]', {
    error: err,
    component: vm?.$options?.name || 'unknown',
    info,
    timestamp: new Date().toISOString()
  })

  const errorMsg = err?.message || String(err || '未知错误')
  if (errorMsg && !errorMsg.includes('NavigationDuplicated')) {
    message.error('应用发生错误', { detail: errorMsg })
  }
}

// 未处理的 Promise 错误
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', {
    reason: event.reason,
    timestamp: new Date().toISOString()
  })

  const reason = event.reason
  const errorMsg = reason?.message || String(reason || '未知错误')
  if (errorMsg && !errorMsg.includes('NavigationDuplicated')) {
    message.error('操作异常', { detail: errorMsg })
  }
})

// Window 全局错误
window.addEventListener('error', (event) => {
  console.error('[Window Error]', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    timestamp: new Date().toISOString()
  })
})

// 使用插件
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 全局属性
app.config.globalProperties.$message = message

app.mount('#app')
