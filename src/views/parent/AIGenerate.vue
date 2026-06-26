<template>
  <div class="page-container">
    <h1 class="page-title">AI智能出题</h1>

    <el-alert
      v-if="!hasConfig"
      type="warning"
      show-icon
      :closable="false"
      class="config-alert"
    >
      <template #title>
        未配置AI服务
      </template>
      <template #default>
        <p>请先配置AI API密钥和模型，才能使用AI出题功能。</p>
        <el-button type="primary" size="small" @click="goToConfig">
          前往配置
        </el-button>
      </template>
    </el-alert>

    <div class="content-wrapper" v-else>
      <el-card class="input-card">
        <template #header>
          <div class="card-header">
            <span>出题设置</span>
          </div>
        </template>

        <el-form label-width="100px">
          <el-form-item label="出题要求">
            <el-input
              v-model="promptText"
              type="textarea"
              :rows="5"
              placeholder="例如：小学三年级数学乘法题，10道"
              maxlength="500"
              show-word-limit
            />
            <div class="example-tips">
              <span class="tip-label">示例：</span>
              <el-tag
                v-for="example in examples"
                :key="example"
                size="small"
                class="example-tag"
                @click="useExample(example)"
              >
                {{ example }}
              </el-tag>
            </div>
          </el-form-item>

          <el-form-item label="题目数量">
            <el-slider
              v-model="questionCount"
              :min="1"
              :max="20"
              :step="1"
              :show-input="true"
              :marks="marks"
              style="max-width: 400px;"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :icon="MagicStick"
              :loading="aiStore.generating"
              @click="handleGenerate"
            >
              {{ aiStore.generating ? '生成中...' : '开始生成' }}
            </el-button>
            <el-button
              v-if="aiStore.generatedQuestions.length > 0"
              :icon="Refresh"
              @click="handleClear"
            >
              清空结果
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="result-card">
        <template #header>
          <div class="card-header">
            <span>生成结果</span>
            <div class="header-actions">
              <span class="count-text" v-if="aiStore.generatedQuestions.length > 0">
                共 {{ aiStore.generatedQuestions.length }} 道题
              </span>
              <el-button
                v-if="aiStore.generatedQuestions.length > 0"
                type="success"
                :icon="Check"
                :loading="savingAll"
                @click="handleSaveAll"
              >
                批量保存
              </el-button>
            </div>
          </div>
        </template>

        <div v-loading="aiStore.generating" class="result-content">
          <el-empty
            v-if="!aiStore.generating && aiStore.generatedQuestions.length === 0"
            description="输入出题要求后点击生成按钮"
            :image-size="120"
          >
            <template #image>
              <el-icon :size="80" color="#dcdfe6">
                <MagicStick />
              </el-icon>
            </template>
          </el-empty>

          <div v-else-if="!aiStore.generating" class="questions-list">
            <div
              v-for="(question, index) in aiStore.generatedQuestions"
              :key="question._tempId"
              class="question-item"
            >
              <div class="question-header">
                <el-tag type="primary" size="small" class="question-num">
                  第 {{ index + 1 }} 题
                </el-tag>
                <el-tag size="small" class="type-tag">
                  {{ question.typeName }}
                </el-tag>
                <el-tag :type="getAnswerTypeTagType(question.answerType)" size="small">
                  {{ getAnswerTypeText(question.answerType) }}
                </el-tag>
                <div class="header-actions-right">
                  <el-button
                    type="primary"
                    link
                    size="small"
                    :icon="Edit"
                    @click="handleEdit(question)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    type="success"
                    link
                    size="small"
                    :icon="Check"
                    :loading="savingMap[question._tempId]"
                    @click="handleSaveSingle(question)"
                  >
                    保存
                  </el-button>
                  <el-button
                    type="danger"
                    link
                    size="small"
                    :icon="Delete"
                    @click="handleDelete(question)"
                  >
                    删除
                  </el-button>
                </div>
              </div>

              <div class="question-body">
                <div class="question-label">题干：</div>
                <div class="question-content" v-html="question.content" />
              </div>

              <div class="question-answer">
                <div class="question-label">答案：</div>
                <div class="answer-content">
                  <template v-if="question.answerType === 'text'">
                    <div class="text-answer">{{ question.answerText }}</div>
                  </template>
                  <template v-else-if="question.answerType === 'choice'">
                    <div class="choice-options">
                      <div
                        v-for="(opt, optIdx) in question.options"
                        :key="optIdx"
                        class="choice-option"
                        :class="{ correct: optIdx === question.correctIndex }"
                      >
                        <span class="option-label">
                          {{ String.fromCharCode(65 + optIdx) }}.
                        </span>
                        <span class="option-text">{{ opt.text || opt }}</span>
                        <el-tag
                          v-if="optIdx === question.correctIndex"
                          type="success"
                          size="small"
                          class="correct-tag"
                        >
                          正确答案
                        </el-tag>
                      </div>
                    </div>
                  </template>
                  <template v-else-if="question.answerType === 'image'">
                    <div class="image-answer">{{ question.answerImage }}</div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <el-dialog
      v-model="editDialogVisible"
      title="编辑题目"
      width="700px"
      :close-on-click-modal="false"
    >
      <QuestionForm
        v-if="editDialogVisible && currentEditQuestion"
        ref="editFormRef"
        :question-data="convertToFormData(currentEditQuestion)"
        :is-edit="true"
      />
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="editSaving" @click="handleEditSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  MagicStick,
  Refresh,
  Check,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import { useAiConfigStore } from '@/stores/aiConfig'
import { useAiStore } from '@/stores/ai'
import { useQuestionStore } from '@/stores/question'
import QuestionForm from '@/components/QuestionForm.vue'

const router = useRouter()
const aiConfigStore = useAiConfigStore()
const aiStore = useAiStore()
const questionStore = useQuestionStore()

const promptText = ref('')
const questionCount = ref(10)
const savingAll = ref(false)
const savingMap = reactive({})
const editDialogVisible = ref(false)
const currentEditQuestion = ref(null)
const editFormRef = ref(null)
const editSaving = ref(false)

const hasConfig = computed(() => aiConfigStore.hasValidConfig())

const marks = {
  1: '1',
  5: '5',
  10: '10',
  15: '15',
  20: '20'
}

const examples = [
  '小学三年级数学乘法题',
  '小学二年级语文看拼音写词语',
  '小学四年级英语单词选择题',
  '小学五年级数学应用题'
]

function goToConfig() {
  router.push('/parent/ai-config')
}

function useExample(text) {
  promptText.value = text
}

function getAnswerTypeText(type) {
  const map = {
    text: '文本答案',
    choice: '选择题',
    image: '图片答案'
  }
  return map[type] || '-'
}

function getAnswerTypeTagType(type) {
  const map = {
    text: '',
    choice: 'warning',
    image: 'info'
  }
  return map[type] || ''
}

async function handleGenerate() {
  if (!promptText.value.trim()) {
    ElMessage.warning('请输入出题要求')
    return
  }

  try {
    await aiStore.generateQuestions(promptText.value.trim(), questionCount.value)
    ElMessage.success(`成功生成 ${aiStore.generatedQuestions.length} 道题目`)
  } catch (err) {
    ElMessage.error(err.message || '生成失败')
  }
}

function handleClear() {
  aiStore.clearGeneratedQuestions()
}

function handleEdit(question) {
  currentEditQuestion.value = { ...question }
  editDialogVisible.value = true
}

function convertToFormData(question) {
  const data = {
    typeId: null,
    content: question.content,
    answerType: question.answerType
  }

  if (question.answerType === 'text') {
    data.answerText = question.answerText
  } else if (question.answerType === 'choice') {
    data.options = question.options.map(opt => 
      typeof opt === 'string' ? { text: opt } : opt
    )
    data.correctIndex = question.correctIndex
  } else if (question.answerType === 'image') {
    data.answerImage = question.answerImage
  }

  return data
}

async function handleEditSubmit() {
  if (!editFormRef.value) return
  const valid = await editFormRef.value.validateForm()
  if (!valid) return

  editSaving.value = true
  try {
    const formData = editFormRef.value.getSubmitData()
    const typeName = questionStore.getTypeById(formData.typeId) || currentEditQuestion.value.typeName

    const updatedData = {
      ...formData,
      typeName
    }

    aiStore.updateGeneratedQuestion(currentEditQuestion.value._tempId, updatedData)
    ElMessage.success('更新成功')
    editDialogVisible.value = false
  } catch (err) {
    ElMessage.error(err.message || '更新失败')
  } finally {
    editSaving.value = false
  }
}

async function handleSaveSingle(question) {
  if (savingMap[question._tempId]) return

  savingMap[question._tempId] = true
  try {
    await aiStore.saveSingleQuestion(question)
    ElMessage.success('保存成功')
    aiStore.removeGeneratedQuestion(question._tempId)
  } catch (err) {
    ElMessage.error(err.message || '保存失败')
  } finally {
    savingMap[question._tempId] = false
  }
}

async function handleSaveAll() {
  if (aiStore.generatedQuestions.length === 0) {
    ElMessage.warning('没有可保存的题目')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要保存全部 ${aiStore.generatedQuestions.length} 道题目到题库吗？`,
      '确认保存',
      {
        confirmButtonText: '确定保存',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
  } catch {
    return
  }

  savingAll.value = true
  try {
    const count = await aiStore.saveAllQuestions()
    ElMessage.success(`成功保存 ${count} 道题目`)
    aiStore.clearGeneratedQuestions()
  } catch (err) {
    ElMessage.error(err.message || '保存失败')
  } finally {
    savingAll.value = false
  }
}

function handleDelete(question) {
  ElMessageBox.confirm(
    '确定要删除这道题目吗？',
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    aiStore.removeGeneratedQuestion(question._tempId)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

onMounted(async () => {
  if (questionStore.types.length === 0) {
    await questionStore.fetchTypes()
  }
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 0;
}

.config-alert {
  margin-bottom: 20px;
}

.content-wrapper {
  display: flex;
  gap: 20px;
  align-items: flex-start;

  .input-card {
    flex-shrink: 0;
    width: 420px;
  }

  .result-card {
    flex: 1;
    min-width: 0;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .count-text {
    font-size: 13px;
    color: #909399;
  }
}

.example-tips {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;

  .tip-label {
    margin-right: 6px;
  }

  .example-tag {
    margin-right: 6px;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }
  }
}

.result-content {
  min-height: 400px;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  transition: border-color 0.2s;

  &:hover {
    border-color: #c0c4cc;
  }
}

.question-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;

  .question-num {
    font-weight: 600;
  }

  .type-tag {
    background-color: #ecf5ff;
    color: #409eff;
    border: 1px solid #d9ecff;
  }

  .header-actions-right {
    margin-left: auto;
    display: flex;
    gap: 4px;
  }
}

.question-body,
.question-answer {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;

  .question-label {
    flex-shrink: 0;
    font-weight: 600;
    color: #606266;
  }
}

.question-body {
  .question-content {
    flex: 1;
    line-height: 1.6;
    color: #303133;
    word-break: break-word;

    :deep(p) {
      margin: 0;
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
    }
  }
}

.question-answer {
  .answer-content {
    flex: 1;
  }

  .text-answer {
    padding: 8px 12px;
    background-color: #f0f9eb;
    border: 1px solid #e1f3d8;
    border-radius: 4px;
    color: #67c23a;
    display: inline-block;
  }

  .image-answer {
    padding: 8px 12px;
    background-color: #f4f4f5;
    border: 1px solid #e9e9eb;
    border-radius: 4px;
    color: #909399;
    display: inline-block;
  }
}

.choice-options {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .choice-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background-color: #f5f7fa;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    transition: all 0.2s;

    &.correct {
      background-color: #f0f9eb;
      border-color: #e1f3d8;
    }

    .option-label {
      font-weight: 600;
      color: #606266;
      flex-shrink: 0;
    }

    .option-text {
      flex: 1;
      color: #303133;
    }

    .correct-tag {
      flex-shrink: 0;
    }
  }
}

@media (max-width: 900px) {
  .content-wrapper {
    flex-direction: column;

    .input-card,
    .result-card {
      width: 100%;
    }
  }
}
</style>
