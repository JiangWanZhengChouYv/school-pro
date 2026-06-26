<template>
  <div class="page-container">
    <h1 class="page-title">AI服务配置</h1>
    <el-card class="config-card">
      <el-tabs v-model="activeTab" class="config-tabs">
        <el-tab-pane label="OpenAI兼容" name="openai">
          <el-form
            ref="openaiFormRef"
            :model="openaiForm"
            :rules="openaiRules"
            label-width="100px"
            class="config-form"
          >
            <el-form-item label="API密钥" prop="apiKey">
              <el-input
                v-model="openaiForm.apiKey"
                type="password"
                placeholder="请输入API密钥"
                show-password
                autocomplete="off"
              />
            </el-form-item>
            <el-form-item label="Base URL" prop="baseUrl">
              <el-input
                v-model="openaiForm.baseUrl"
                placeholder="https://api.openai.com/v1"
              />
              <div class="form-tip">默认 OpenAI 官方地址，兼容 DeepSeek、Moonshot 等其他 API</div>
            </el-form-item>
            <el-form-item label="模型名称" prop="model">
              <el-select
                v-model="openaiForm.model"
                placeholder="请选择或输入模型名称"
                filterable
                allow-create
                default-first-option
                style="width: 100%"
              >
                <el-option label="gpt-4o-mini" value="gpt-4o-mini" />
                <el-option label="gpt-4o" value="gpt-4o" />
                <el-option label="gpt-4-turbo" value="gpt-4-turbo" />
                <el-option label="deepseek-chat" value="deepseek-chat" />
                <el-option label="deepseek-coder" value="deepseek-coder" />
                <el-option label="moonshot-v1-8k" value="moonshot-v1-8k" />
                <el-option label="moonshot-v1-32k" value="moonshot-v1-32k" />
                <el-option label="qwen-plus" value="qwen-plus" />
                <el-option label="qwen-turbo" value="qwen-turbo" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="Anthropic" name="anthropic">
          <el-form
            ref="anthropicFormRef"
            :model="anthropicForm"
            :rules="anthropicRules"
            label-width="100px"
            class="config-form"
          >
            <el-form-item label="API密钥" prop="apiKey">
              <el-input
                v-model="anthropicForm.apiKey"
                type="password"
                placeholder="请输入Anthropic API密钥"
                show-password
                autocomplete="off"
              />
            </el-form-item>
            <el-form-item label="模型名称" prop="model">
              <el-select
                v-model="anthropicForm.model"
                placeholder="请选择或输入模型名称"
                filterable
                allow-create
                default-first-option
                style="width: 100%"
              >
                <el-option label="claude-3-haiku-20240307" value="claude-3-haiku-20240307" />
                <el-option label="claude-3-sonnet-20240229" value="claude-3-sonnet-20240229" />
                <el-option label="claude-3-opus-20240229" value="claude-3-opus-20240229" />
                <el-option label="claude-3-5-sonnet-20240620" value="claude-3-5-sonnet-20240620" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <el-divider />

      <div class="action-buttons">
        <el-button type="primary" :loading="saving" @click="handleSave">
          保存配置
        </el-button>
        <el-button :loading="testing" @click="handleTest">
          测试连接
        </el-button>
      </div>

      <el-alert
        v-if="testResult"
        :title="testResult.success ? '测试成功' : '测试失败'"
        :type="testResult.success ? 'success' : 'error'"
        :closable="false"
        class="test-result"
        show-icon
      >
        <template v-if="testResult.success">
          <p>{{ testResult.message }}</p>
          <p v-if="testResult.response" class="test-response">
            回复：{{ testResult.response }}
          </p>
        </template>
        <template v-else>
          <p>{{ testResult.message }}</p>
        </template>
      </el-alert>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAiConfigStore } from '@/stores/aiConfig'

const aiConfigStore = useAiConfigStore()

const activeTab = ref('openai')
const openaiFormRef = ref(null)
const anthropicFormRef = ref(null)
const saving = ref(false)
const testing = ref(false)
const testResult = ref(null)

const openaiForm = reactive({
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: ''
})

const anthropicForm = reactive({
  apiKey: '',
  model: ''
})

const openaiRules = {
  apiKey: [
    { required: true, message: '请输入API密钥', trigger: 'blur' }
  ],
  baseUrl: [
    { required: true, message: '请输入Base URL', trigger: 'blur' }
  ],
  model: [
    { required: true, message: '请输入模型名称', trigger: 'blur' }
  ]
}

const anthropicRules = {
  apiKey: [
    { required: true, message: '请输入API密钥', trigger: 'blur' }
  ],
  model: [
    { required: true, message: '请输入模型名称', trigger: 'blur' }
  ]
}

function loadConfigToForm() {
  const config = aiConfigStore.getCurrentConfig()
  if (config.apiType === 'anthropic') {
    activeTab.value = 'anthropic'
    anthropicForm.apiKey = config.apiKey || ''
    anthropicForm.model = config.model || ''
  } else {
    activeTab.value = 'openai'
    openaiForm.apiKey = config.apiKey || ''
    openaiForm.baseUrl = config.baseUrl || 'https://api.openai.com/v1'
    openaiForm.model = config.model || ''
  }
}

function getCurrentConfigData() {
  if (activeTab.value === 'anthropic') {
    return {
      apiType: 'anthropic',
      apiKey: anthropicForm.apiKey,
      baseUrl: '',
      model: anthropicForm.model
    }
  }
  return {
    apiType: 'openai',
    apiKey: openaiForm.apiKey,
    baseUrl: openaiForm.baseUrl,
    model: openaiForm.model
  }
}

async function validateCurrentForm() {
  if (activeTab.value === 'anthropic') {
    if (!anthropicFormRef.value) return false
    try {
      await anthropicFormRef.value.validate()
      return true
    } catch {
      return false
    }
  } else {
    if (!openaiFormRef.value) return false
    try {
      await openaiFormRef.value.validate()
      return true
    } catch {
      return false
    }
  }
}

async function handleSave() {
  const valid = await validateCurrentForm()
  if (!valid) {
    ElMessage.warning('请填写完整的配置信息')
    return
  }
  saving.value = true
  try {
    const configData = getCurrentConfigData()
    aiConfigStore.saveConfig(configData)
    ElMessage.success('配置保存成功')
  } catch (err) {
    ElMessage.error(err.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function handleTest() {
  testResult.value = null
  const valid = await validateCurrentForm()
  if (!valid) {
    ElMessage.warning('请先填写完整的配置信息再测试')
    return
  }
  testing.value = true
  try {
    const configData = getCurrentConfigData()
    const result = await aiConfigStore.testConnection(configData)
    testResult.value = result
  } catch (err) {
    testResult.value = {
      success: false,
      message: err.message || '测试失败'
    }
  } finally {
    testing.value = false
  }
}

onMounted(() => {
  loadConfigToForm()
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 0;
}

.config-card {
  max-width: 680px;
}

.config-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 24px;
  }
}

.config-form {
  max-width: 520px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.test-result {
  margin-top: 16px;

  .test-response {
    margin: 4px 0 0;
    font-size: 13px;
    color: #67c23a;
    word-break: break-all;
  }
}
</style>
