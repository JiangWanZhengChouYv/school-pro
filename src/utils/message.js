import { ElMessage } from 'element-plus'

const DEBOUNCE_MS = 1000
const MAX_DUPLICATE_MS = 2000

const lastMessages = {
  success: { text: '', time: 0 },
  error: { text: '', time: 0 },
  warning: { text: '', time: 0 },
  info: { text: '', time: 0 }
}

function shouldShow(type, message) {
  const last = lastMessages[type]
  const now = Date.now()
  const msgStr = typeof message === 'string' ? message : JSON.stringify(message)

  if (last.text === msgStr && now - last.time < MAX_DUPLICATE_MS) {
    return false
  }

  last.text = msgStr
  last.time = now
  return true
}

const message = {
  success(msg, options = {}) {
    if (!shouldShow('success', msg)) return
    return ElMessage.success({
      message: msg,
      duration: options.duration || 2000,
      showClose: options.showClose !== false,
      ...options
    })
  },

  error(msg, options = {}) {
    if (!shouldShow('error', msg)) return
    const detail = options.detail
    const messageText = detail ? `${msg}\n${detail}` : msg
    return ElMessage.error({
      message: messageText,
      duration: options.duration || 4000,
      showClose: options.showClose !== false,
      ...options
    })
  },

  warning(msg, options = {}) {
    if (!shouldShow('warning', msg)) return
    return ElMessage.warning({
      message: msg,
      duration: options.duration || 3000,
      showClose: options.showClose !== false,
      ...options
    })
  },

  info(msg, options = {}) {
    if (!shouldShow('info', msg)) return
    return ElMessage.info({
      message: msg,
      duration: options.duration || 3000,
      showClose: options.showClose !== false,
      ...options
    })
  },

  loading(msg = '加载中...') {
    return ElMessage({
      message: msg,
      type: 'info',
      duration: 0,
      showClose: false,
      icon: 'Loading',
      customClass: 'message-loading'
    })
  },

  closeAll() {
    ElMessage.closeAll()
  }
}

export default message
export { message }
