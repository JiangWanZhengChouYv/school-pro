import { defineStore } from 'pinia'
import { ref } from 'vue'
import { simpleEncrypt, simpleDecrypt } from '@/utils/crypto'
import storage from '@/utils/storage'
import { testAIConnection, createAIClient } from '@/utils/aiApi'

const AI_CONFIG_KEY = 'ai_config'

const defaultConfig = {
  apiType: 'openai',
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: ''
}

export const useAiConfigStore = defineStore('aiConfig', () => {
  const config = ref({ ...defaultConfig })

  function loadConfig() {
    const encrypted = storage.get(AI_CONFIG_KEY)
    if (encrypted) {
      try {
        const decrypted = simpleDecrypt(encrypted)
        if (decrypted) {
          const parsed = JSON.parse(decrypted)
          config.value = { ...defaultConfig, ...parsed }
        }
      } catch (e) {
        console.error('Failed to load AI config:', e)
      }
    }
    return config.value
  }

  function saveConfig(newConfig) {
    config.value = { ...defaultConfig, ...newConfig }
    const jsonStr = JSON.stringify(config.value)
    const encrypted = simpleEncrypt(jsonStr)
    storage.set(AI_CONFIG_KEY, encrypted)
    return true
  }

  async function testConnection(testConfig) {
    const cfg = testConfig || config.value
    return await testAIConnection(cfg)
  }

  function getCurrentConfig() {
    return { ...config.value }
  }

  function hasValidConfig() {
    const cfg = config.value
    if (!cfg.apiKey || !cfg.model) return false
    if (cfg.apiType === 'openai' && !cfg.baseUrl) return false
    return true
  }

  function getClient() {
    if (!hasValidConfig()) {
      throw new Error('AI配置不完整，请先在设置中配置API密钥和模型')
    }
    return createAIClient(config.value)
  }

  loadConfig()

  return {
    config,
    loadConfig,
    saveConfig,
    testConnection,
    getCurrentConfig,
    hasValidConfig,
    getClient
  }
})
