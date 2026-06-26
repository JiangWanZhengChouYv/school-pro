<template>
  <div class="wrong-book-page">
    <div class="page-header">
      <el-button :icon="ArrowLeft" circle @click="goHome">返回</el-button>
      <h1 class="page-title">
        <span class="title-icon">📕</span>
        错题本
      </h1>
      <el-select
        v-model="selectedTypeId"
        placeholder="选择类型"
        class="type-select"
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
    </div>

    <div v-loading="loading" class="wrong-list">
      <div v-if="filteredWrongRecords.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">🎉</div>
        <h3 class="empty-title">太棒了！暂无错题</h3>
        <p class="empty-desc">继续保持，你是最棒的！</p>
        <el-button type="primary" size="large" @click="goHome">
          返回练习
        </el-button>
      </div>

      <div v-else class="wrong-cards">
        <div
          v-for="(record, index) in paginatedRecords"
          :key="record.id"
          class="wrong-card"
        >
          <div class="card-header">
            <span class="wrong-index">第 {{ (currentPage - 1) * pageSize + index + 1 }} 题</span>
            <span class="wrong-tag">答错了</span>
            <span class="type-tag">{{ getTypeName(record.typeId) }}</span>
          </div>

          <div class="question-content" v-html="record.questionContent"></div>

          <div class="answer-comparison">
            <div class="answer-item wrong-answer">
              <div class="answer-label">
                <span class="label-icon">❌</span>
                你的答案
              </div>
              <div class="answer-text">{{ record.userAnswer || '未作答' }}</div>
            </div>
            <div class="answer-item correct-answer">
              <div class="answer-label">
                <span class="label-icon">✅</span>
                正确答案
              </div>
              <div class="answer-text">{{ record.correctAnswer || '见图片' }}</div>
            </div>
          </div>

          <div v-if="record.answerType === 'image' && record.answerImage" class="answer-image-wrap">
            <div class="answer-image-label">答案图片：</div>
            <img :src="record.answerImage" alt="答案图片" class="answer-image" />
          </div>

          <div class="card-footer">
            <span class="answer-time">
              <span class="time-icon">🕐</span>
              {{ formatTime(record.createdAt) }}
            </span>
            <el-button
              type="primary"
              class="retry-btn"
              @click="retryQuestion(record)"
            >
              <span class="btn-icon">🔄</span>
              重做此题
            </el-button>
          </div>
        </div>
      </div>

      <div v-if="filteredWrongRecords.length > 0" class="pagination-wrap">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20]"
          :total="filteredWrongRecords.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useAnswerStore } from '@/stores/answer'
import { useQuestionStore } from '@/stores/question'

const router = useRouter()
const answerStore = useAnswerStore()
const questionStore = useQuestionStore()

const loading = ref(true)
const selectedTypeId = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const filteredWrongRecords = computed(() => {
  if (!selectedTypeId.value) {
    return answerStore.wrongRecords
  }
  return answerStore.wrongRecords.filter(r => r.typeId === selectedTypeId.value)
})

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredWrongRecords.value.slice(start, end)
})

function getTypeName(typeId) {
  return questionStore.getTypeById(typeId) || '未分类'
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

function handleTypeChange() {
  currentPage.value = 1
}

function retryQuestion(record) {
  router.push(`/student/practice?typeId=${record.typeId}&questionId=${record.questionId}`)
}

function goHome() {
  router.push('/')
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
.wrong-book-page {
  min-height: calc(100vh - 100px);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);

  .page-title {
    flex: 1;
    font-size: 24px;
    font-weight: 700;
    color: #303133;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;

    .title-icon {
      font-size: 28px;
    }
  }

  .type-select {
    width: 180px;
  }
}

.wrong-list {
  min-height: 400px;
}

.wrong-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wrong-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  border-left: 4px solid #f56c6c;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;

  .wrong-index {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .wrong-tag {
    background: #fef0f0;
    color: #f56c6c;
    padding: 2px 10px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 500;
  }

  .type-tag {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    padding: 2px 10px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 500;
    margin-left: auto;
  }
}

.question-content {
  font-size: 16px;
  line-height: 1.8;
  color: #303133;
  margin-bottom: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #fff5f8 0%, #f0f7ff 100%);
  border-radius: 12px;

  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 10px 0;
  }
}

.answer-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;

  .answer-item {
    padding: 16px;
    border-radius: 12px;

    &.wrong-answer {
      background: #fef0f0;
    }

    &.correct-answer {
      background: #f0f9eb;
    }

    .answer-label {
      font-size: 13px;
      color: #909399;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;

      .label-icon {
        font-size: 14px;
      }
    }

    .answer-text {
      font-size: 15px;
      color: #303133;
      font-weight: 500;
      line-height: 1.6;
      word-break: break-all;
    }
  }
}

.answer-image-wrap {
  margin-bottom: 16px;

  .answer-image-label {
    font-size: 13px;
    color: #666;
    margin-bottom: 8px;
  }

  .answer-image {
    max-width: 100%;
    max-height: 250px;
    border-radius: 8px;
    border: 2px solid #e4e7ed;
  }
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #f0f2f5;

  .answer-time {
    font-size: 13px;
    color: #909399;
    display: flex;
    align-items: center;
    gap: 6px;

    .time-icon {
      font-size: 14px;
    }
  }

  .retry-btn {
    border-radius: 20px;
    font-weight: 600;
    background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
    border: none;

    .btn-icon {
      margin-right: 4px;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
    }
  }
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding: 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);

  :deep(.el-pagination) {
    .is-active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);

  .empty-icon {
    font-size: 80px;
    margin-bottom: 20px;
    animation: bounce 2s ease-in-out infinite;
  }

  .empty-title {
    font-size: 22px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 10px;
  }

  .empty-desc {
    font-size: 15px;
    color: #909399;
    margin-bottom: 28px;
  }

  .el-button {
    border-radius: 25px;
    padding: 0 32px;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-wrap: wrap;

    .page-title {
      font-size: 20px;
      order: -1;
      width: 100%;
    }

    .type-select {
      flex: 1;
    }
  }

  .answer-comparison {
    grid-template-columns: 1fr;
  }

  .card-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;

    .retry-btn {
      width: 100%;
    }
  }
}
</style>
