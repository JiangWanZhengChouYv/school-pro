<template>
  <div class="page-container">
    <h1 class="page-title">AI错题分析</h1>

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
        <p>请先配置AI API密钥和模型，才能使用错题分析功能。</p>
        <el-button type="primary" size="small" @click="goToConfig">
          前往配置
        </el-button>
      </template>
    </el-alert>

    <div class="content-wrapper" v-else>
      <el-card class="selector-card">
        <template #header>
          <div class="card-header">
            <span>选择错题</span>
            <span class="selected-count">
              已选 {{ selectedIds.length }} / {{ filteredWrongRecords.length }} 题
            </span>
          </div>
        </template>

        <div class="filter-bar">
          <el-select
            v-model="selectedTypeId"
            placeholder="选择类型"
            class="type-select"
            clearable
            @change="handleTypeChange"
          >
            <el-option label="全部类型" value="" />
            <el-option
              v-for="type in questionStore.types"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            />
          </el-select>

          <el-checkbox
            v-model="isAllSelected"
            :indeterminate="isIndeterminate"
            :disabled="filteredWrongRecords.length === 0"
            @change="handleSelectAll"
          >
            全选
          </el-checkbox>
        </div>

        <div v-loading="loading" class="wrong-list">
          <el-empty
            v-if="!loading && filteredWrongRecords.length === 0"
            description="暂无错题记录"
            :image-size="100"
          >
            <template #image>
              <el-icon :size="60" color="#dcdfe6">
                <CircleCheck />
              </el-icon>
            </template>
          </el-empty>

          <div v-else class="wrong-items">
            <div
              v-for="record in filteredWrongRecords"
              :key="record.id"
              class="wrong-item"
              :class="{ selected: selectedIds.includes(record.id) }"
              @click="toggleSelect(record.id)"
            >
              <el-checkbox
                :model-value="selectedIds.includes(record.id)"
                class="item-checkbox"
                @click.stop
                @change="toggleSelect(record.id)"
              />
              <div class="item-content">
                <div class="item-summary">
                  <el-tag size="small" class="type-tag">
                    {{ getTypeName(record.typeId) }}
                  </el-tag>
                  <span class="summary-text">{{ getSummary(record.questionContent) }}</span>
                </div>
                <div class="item-answers">
                  <div class="answer-line wrong">
                    <span class="answer-label">学生答案：</span>
                    <span class="answer-text">{{ formatAnswer(record) }}</span>
                  </div>
                  <div class="answer-line correct">
                    <span class="answer-label">正确答案：</span>
                    <span class="answer-text">{{ record.correctAnswer || '见详情' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="result-card">
        <template #header>
          <div class="card-header">
            <span>分析结果</span>
            <div class="header-actions">
              <el-button
                type="primary"
                :icon="MagicStick"
                :loading="aiStore.analyzing"
                :disabled="selectedIds.length === 0"
                @click="handleAnalyze"
              >
                {{ aiStore.analyzing ? '分析中...' : '开始分析' }}
              </el-button>
            </div>
          </div>
        </template>

        <div v-loading="aiStore.analyzing" class="result-content">
          <el-empty
            v-if="!aiStore.analyzing && aiStore.analysisResults.length === 0"
            description="选择错题后点击开始分析"
            :image-size="120"
          >
            <template #image>
              <el-icon :size="80" color="#dcdfe6">
                <DataAnalysis />
              </el-icon>
            </template>
          </el-empty>

          <div v-else-if="!aiStore.analyzing" class="analysis-list">
            <div
              v-for="(result, index) in aiStore.analysisResults"
              :key="result.questionId"
              class="analysis-card"
            >
              <div class="card-title">
                <span class="title-num">第 {{ index + 1 }} 题</span>
                <div class="title-tags">
                  <el-tag
                    :type="getDifficultyTagType(result.difficulty)"
                    size="small"
                    class="difficulty-tag"
                  >
                    {{ result.difficulty || '未知' }}
                  </el-tag>
                  <el-tag type="info" size="small" class="knowledge-tag">
                    {{ result.knowledgePoint || '未知知识点' }}
                  </el-tag>
                  <el-tag
                    :type="getScoreTagType(result.score)"
                    size="small"
                    class="score-tag"
                  >
                    得分：{{ result.score ?? '-' }}/10
                  </el-tag>
                </div>
              </div>

              <div class="card-section">
                <div class="section-label">题目题干</div>
                <div class="section-content question-text" v-html="result.questionContent" />
              </div>

              <div class="card-section">
                <div class="section-label">
                  <el-icon color="#f56c6c"><Warning /></el-icon>
                  错误原因分析
                </div>
                <div class="section-content reason-text">
                  {{ result.errorReason || '暂无分析' }}
                </div>
              </div>

              <div class="card-section">
                <div class="section-label">
                  <el-icon color="#67c23a"><CircleCheck /></el-icon>
                  改进建议
                </div>
                <div class="section-content suggestion-text">
                  {{ result.suggestion || '暂无建议' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  MagicStick,
  DataAnalysis,
  CircleCheck,
  Warning
} from '@element-plus/icons-vue'
import { useAiConfigStore } from '@/stores/aiConfig'
import { useAiStore } from '@/stores/ai'
import { useAnswerStore } from '@/stores/answer'
import { useQuestionStore } from '@/stores/question'

const router = useRouter()
const aiConfigStore = useAiConfigStore()
const aiStore = useAiStore()
const answerStore = useAnswerStore()
const questionStore = useQuestionStore()

const loading = ref(true)
const selectedTypeId = ref('')
const selectedIds = ref([])

const hasConfig = computed(() => aiConfigStore.hasValidConfig())

const filteredWrongRecords = computed(() => {
  if (!selectedTypeId.value) {
    return answerStore.wrongRecords
  }
  return answerStore.wrongRecords.filter(r => r.typeId === selectedTypeId.value)
})

const isAllSelected = computed(() => {
  if (filteredWrongRecords.value.length === 0) return false
  return filteredWrongRecords.value.every(r => selectedIds.value.includes(r.id))
})

const isIndeterminate = computed(() => {
  const count = filteredWrongRecords.value.filter(r => selectedIds.value.includes(r.id)).length
  return count > 0 && count < filteredWrongRecords.value.length
})

function goToConfig() {
  router.push('/parent/ai-config')
}

function getTypeName(typeId) {
  return questionStore.getTypeById(typeId) || '未分类'
}

function getSummary(html) {
  const tmp = document.createElement('div')
  tmp.innerHTML = html || ''
  const text = tmp.textContent || tmp.innerText || ''
  return text.length > 50 ? text.slice(0, 50) + '...' : text
}

function formatAnswer(record) {
  if (record.answerType === 'choice' && record.userAnswer !== undefined && record.userAnswer !== null) {
    if (typeof record.userAnswer === 'number') {
      return `选项${String.fromCharCode(65 + record.userAnswer)}`
    }
    return String(record.userAnswer)
  }
  return record.userAnswer || '未作答'
}

function handleTypeChange() {
  selectedIds.value = []
}

function toggleSelect(id) {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

function handleSelectAll(val) {
  if (val) {
    selectedIds.value = filteredWrongRecords.value.map(r => r.id)
  } else {
    selectedIds.value = []
  }
}

function getDifficultyTagType(difficulty) {
  const map = {
    '简单': 'success',
    '中等': 'warning',
    '困难': 'danger'
  }
  return map[difficulty] || 'info'
}

function getScoreTagType(score) {
  if (score === undefined || score === null) return 'info'
  if (score >= 7) return 'success'
  if (score >= 4) return 'warning'
  return 'danger'
}

async function handleAnalyze() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要分析的错题')
    return
  }

  const selectedRecords = answerStore.wrongRecords.filter(
    r => selectedIds.value.includes(r.id)
  )

  const questionsForAnalysis = selectedRecords.map(record => ({
    recordId: record.id,
    questionId: record.questionId,
    questionContent: record.questionContent,
    userAnswer: record.userAnswer,
    correctAnswer: record.correctAnswer,
    answerType: record.answerType,
    typeId: record.typeId
  }))

  try {
    await aiStore.analyzeWrongQuestions(questionsForAnalysis)
    ElMessage.success('分析完成')
  } catch (err) {
    ElMessage.error(err.message || '分析失败')
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await questionStore.fetchTypes()
    await answerStore.fetchWrongRecords()
  } finally {
    loading.value = false
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

  .selector-card {
    flex-shrink: 0;
    width: 420px;
    max-height: calc(100vh - 140px);
    display: flex;
    flex-direction: column;
  }

  .result-card {
    flex: 1;
    min-width: 0;
    max-height: calc(100vh - 140px);
    display: flex;
    flex-direction: column;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .selected-count {
    font-size: 13px;
    color: #909399;
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f2f5;

  .type-select {
    flex: 1;
  }
}

.wrong-list {
  flex: 1;
  overflow-y: auto;
  min-height: 300px;
}

.wrong-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wrong-item {
  display: flex;
  gap: 10px;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #c0c4cc;
    background-color: #fafafa;
  }

  &.selected {
    border-color: #409eff;
    background-color: #ecf5ff;
  }

  .item-checkbox {
    flex-shrink: 0;
    margin-top: 2px;
  }

  .item-content {
    flex: 1;
    min-width: 0;
  }

  .item-summary {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 8px;

    .type-tag {
      flex-shrink: 0;
    }

    .summary-text {
      flex: 1;
      font-size: 14px;
      color: #303133;
      line-height: 1.5;
      word-break: break-all;
    }
  }

  .item-answers {
    font-size: 12px;
    line-height: 1.6;

    .answer-line {
      display: flex;
      gap: 4px;

      .answer-label {
        flex-shrink: 0;
        color: #909399;
      }

      .answer-text {
        flex: 1;
        word-break: break-all;
      }

      &.wrong .answer-text {
        color: #f56c6c;
      }

      &.correct .answer-text {
        color: #67c23a;
      }
    }
  }
}

.result-content {
  flex: 1;
  overflow-y: auto;
  min-height: 400px;
}

.analysis-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.analysis-card {
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .card-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f2f5;

    .title-num {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .title-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  }

  .card-section {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 600;
      color: #606266;
      margin-bottom: 8px;
    }

    .section-content {
      font-size: 14px;
      line-height: 1.7;
      color: #303133;
      padding: 12px 16px;
      background-color: #fafafa;
      border-radius: 8px;
      word-break: break-word;
    }

    .question-text {
      background-color: #f5f7fa;

      :deep(p) {
        margin: 0;
      }

      :deep(img) {
        max-width: 100%;
        height: auto;
      }
    }

    .reason-text {
      color: #f56c6c;
      background-color: #fef0f0;
      border-left: 3px solid #f56c6c;
    }

    .suggestion-text {
      color: #67c23a;
      background-color: #f0f9eb;
      border-left: 3px solid #67c23a;
    }
  }
}

@media (max-width: 900px) {
  .content-wrapper {
    flex-direction: column;

    .selector-card,
    .result-card {
      width: 100%;
      max-height: none;
    }
  }
}
</style>
