import message from './message'

const HTTP_ERROR_MESSAGES = {
  400: '请求参数错误，请检查输入内容',
  401: '认证失败，请检查API密钥是否正确',
  403: '没有权限访问该资源',
  404: '请求的资源不存在',
  408: '请求超时，请稍后重试',
  429: '请求过于频繁，请稍后再试',
  500: '服务器内部错误，请稍后重试',
  502: '网关错误，请稍后重试',
  503: '服务暂不可用，请稍后重试',
  504: '网关超时，请稍后重试'
}

const AI_ERROR_PATTERNS = [
  { pattern: /invalid.*key|api.*key.*invalid|认证失败/i, type: 'auth', message: 'API密钥无效，请检查密钥配置' },
  { pattern: /insufficient.*quota|quota.*exceeded|额度不足|余额不足/i, type: 'quota', message: 'API额度不足，请充值或更换密钥' },
  { pattern: /rate.*limit|too.*many.*request|速率限制|请求过于频繁/i, type: 'rateLimit', message: '请求过于频繁，请稍后再试' },
  { pattern: /model.*not.*found|模型不存在|invalid.*model/i, type: 'model', message: '模型名称不正确，请检查模型配置' },
  { pattern: /context.*length.*exceeded|token.*limit|上下文过长|token.*exceeded/i, type: 'contextLength', message: '内容过长，请减少输入内容' },
  { pattern: /network.*error|fetch.*failed|networkerror|网络错误|连接失败/i, type: 'network', message: '网络连接失败，请检查网络设置' },
  { pattern: /timeout|timed.*out|超时/i, type: 'timeout', message: '请求超时，请稍后重试' },
  { pattern: /no.*response|no.*choice|未能返回|empty.*response/i, type: 'emptyResponse', message: 'AI未返回有效内容，请重试' }
]

const DB_ERROR_MESSAGES = {
  'ConstraintError': '数据已存在，请勿重复添加',
  'NotFoundError': '数据不存在',
  'QuotaExceededError': '存储空间不足，请清理数据',
  'VersionError': '数据库版本错误，请刷新页面重试',
  'InvalidStateError': '数据库状态异常，请刷新页面重试',
  'TransactionInactiveError': '事务已失效，请重试',
  'DataError': '数据格式错误',
  'DataCloneError': '数据克隆失败'
}

export function getHttpErrorMessage(status) {
  return HTTP_ERROR_MESSAGES[status] || `请求失败 (HTTP ${status})`
}

export function getAIErrorMessage(error) {
  const errorMsg = error?.message || error?.error?.message || String(error || '')
  const errorCode = error?.code || error?.error?.code || ''

  for (const pattern of AI_ERROR_PATTERNS) {
    if (pattern.pattern.test(errorMsg) || pattern.pattern.test(errorCode)) {
      return {
        type: pattern.type,
        userMessage: pattern.message,
        detail: errorMsg,
        originalError: error
      }
    }
  }

  return {
    type: 'unknown',
    userMessage: 'AI服务异常，请稍后重试',
    detail: errorMsg,
    originalError: error
  }
}

export function getDBErrorMessage(error) {
  const errorName = error?.name || ''
  const errorMessage = error?.message || String(error || '')

  const mappedMessage = DB_ERROR_MESSAGES[errorName]
  if (mappedMessage) {
    return {
      type: errorName,
      userMessage: mappedMessage,
      detail: errorMessage,
      originalError: error
    }
  }

  return {
    type: 'UnknownDBError',
    userMessage: '数据操作失败，请重试',
    detail: errorMessage,
    originalError: error
  }
}

export function handleNetworkError(error, showMessage = true) {
  const status = error?.status || error?.response?.status
  const userMessage = status ? getHttpErrorMessage(status) : '网络请求失败，请检查网络连接'

  console.error('[Network Error]', {
    status,
    message: error?.message,
    url: error?.config?.url,
    error
  })

  if (showMessage) {
    message.error(userMessage, { detail: error?.message })
  }

  return {
    type: status ? `HTTP_${status}` : 'NetworkError',
    userMessage,
    detail: error?.message,
    originalError: error
  }
}

export function handleAIError(error, showMessage = true) {
  const result = getAIErrorMessage(error)

  console.error('[AI Error]', {
    type: result.type,
    userMessage: result.userMessage,
    detail: result.detail,
    error
  })

  if (showMessage) {
    message.error(result.userMessage)
  }

  return result
}

export function handleDBError(error, operation = '数据库操作', showMessage = true) {
  const result = getDBErrorMessage(error)

  console.error(`[DB Error] ${operation}:`, {
    type: result.type,
    userMessage: result.userMessage,
    detail: result.detail,
    error
  })

  if (showMessage) {
    message.error(`${operation}失败`, { detail: result.userMessage })
  }

  return result
}

export function handleError(error, context = '操作', showMessage = true) {
  if (error?.isAxiosError || error?.config || error?.response) {
    return handleNetworkError(error, showMessage)
  }

  if (error?.name && Object.keys(DB_ERROR_MESSAGES).includes(error.name)) {
    return handleDBError(error, context, showMessage)
  }

  const errorMsg = error?.message || String(error || '未知错误')

  console.error(`[Error] ${context}:`, error)

  if (showMessage) {
    message.error(`${context}失败`, { detail: errorMsg })
  }

  return {
    type: 'UnknownError',
    userMessage: `${context}失败`,
    detail: errorMsg,
    originalError: error
  }
}

export default {
  getHttpErrorMessage,
  getAIErrorMessage,
  getDBErrorMessage,
  handleNetworkError,
  handleAIError,
  handleDBError,
  handleError
}
