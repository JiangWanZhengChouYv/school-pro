const MAX_RETRIES = 2
const RETRY_DELAY = 1000

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  let lastError
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`
        try {
          const errorData = await response.json()
          if (errorData.error?.message) {
            errorMessage = errorData.error.message
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch {
          // ignore
        }
        throw new Error(errorMessage)
      }
      return await response.json()
    } catch (err) {
      lastError = err
      if (i < retries) {
        await delay(RETRY_DELAY * (i + 1))
      }
    }
  }
  throw lastError
}

class OpenAIClient {
  constructor(config) {
    this.apiKey = config.apiKey
    this.baseUrl = (config.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '')
    this.model = config.model
  }

  async chatCompletions({ messages, tools, temperature, maxTokens }) {
    const body = {
      model: this.model,
      messages
    }
    if (tools && tools.length > 0) {
      body.tools = tools
    }
    if (temperature !== undefined) {
      body.temperature = temperature
    }
    if (maxTokens !== undefined) {
      body.max_tokens = maxTokens
    }

    const data = await fetchWithRetry(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    })

    const choice = data.choices?.[0]
    if (!choice) {
      throw new Error('No response choices returned')
    }

    const result = {
      content: choice.message?.content || '',
      role: choice.message?.role || 'assistant',
      toolCalls: choice.message?.tool_calls?.map(tc => ({
        id: tc.id,
        type: tc.type,
        function: {
          name: tc.function?.name,
          arguments: tc.function?.arguments
        }
      })) || [],
      raw: data
    }

    return result
  }
}

class AnthropicClient {
  constructor(config) {
    this.apiKey = config.apiKey
    this.model = config.model
  }

  async chatCompletions({ messages, tools, temperature, maxTokens }) {
    const systemMessages = messages.filter(m => m.role === 'system')
    const userMessages = messages.filter(m => m.role !== 'system')

    const transformedMessages = userMessages.map(msg => {
      if (msg.role === 'assistant') {
        const content = []
        if (msg.content) {
          content.push({ type: 'text', text: msg.content })
        }
        if (msg.tool_calls) {
          for (const tc of msg.tool_calls) {
            content.push({
              type: 'tool_use',
              id: tc.id,
              name: tc.function?.name,
              input: JSON.parse(tc.function?.arguments || '{}')
            })
          }
        }
        return { role: 'assistant', content }
      }
      if (msg.role === 'tool') {
        return {
          role: 'user',
          content: [{
            type: 'tool_result',
            tool_use_id: msg.tool_call_id,
            content: msg.content
          }]
        }
      }
      if (typeof msg.content === 'string') {
        return { role: msg.role, content: msg.content }
      }
      return msg
    })

    const body = {
      model: this.model,
      max_tokens: maxTokens || 1024,
      messages: transformedMessages
    }

    if (systemMessages.length > 0) {
      body.system = systemMessages.map(m => m.content).join('\n')
    }

    if (tools && tools.length > 0) {
      body.tools = tools.map(t => ({
        name: t.function?.name || t.name,
        description: t.function?.description || t.description,
        input_schema: t.function?.parameters || t.parameters || { type: 'object', properties: {} }
      }))
    }

    if (temperature !== undefined) {
      body.temperature = temperature
    }

    const data = await fetchWithRetry('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    })

    let content = ''
    const toolCalls = []

    if (Array.isArray(data.content)) {
      for (const block of data.content) {
        if (block.type === 'text') {
          content += block.text
        } else if (block.type === 'tool_use') {
          toolCalls.push({
            id: block.id,
            type: 'function',
            function: {
              name: block.name,
              arguments: JSON.stringify(block.input || {})
            }
          })
        }
      }
    }

    return {
      content,
      role: 'assistant',
      toolCalls,
      raw: data
    }
  }
}

export function createAIClient(config) {
  if (!config || !config.apiKey || !config.model) {
    throw new Error('AI配置不完整，请先配置API密钥和模型')
  }

  const apiType = config.apiType || 'openai'

  if (apiType === 'anthropic') {
    return new AnthropicClient(config)
  }

  return new OpenAIClient(config)
}

export async function testAIConnection(config) {
  try {
    const client = createAIClient(config)
    const result = await client.chatCompletions({
      messages: [
        { role: 'user', content: '你好，请回复"连接成功"' }
      ],
      maxTokens: 50
    })
    return {
      success: true,
      message: '连接测试成功',
      response: result.content
    }
  } catch (err) {
    return {
      success: false,
      message: err.message || '连接测试失败'
    }
  }
}

export default {
  createAIClient,
  testAIConnection
}
