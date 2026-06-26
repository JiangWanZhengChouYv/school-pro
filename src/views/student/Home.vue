<template>
  <div class="student-home">
    <div class="welcome-section">
      <div class="welcome-card">
        <div class="welcome-text">
          <h1 class="welcome-title">欢迎回来，小同学！👋</h1>
          <p class="welcome-subtitle">今天也要加油哦~ 每天进步一点点！</p>
        </div>
        <div class="welcome-icon">🚀</div>
      </div>
    </div>

    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-info">
          <div class="stat-number">{{ answerStore.stats.total }}</div>
          <div class="stat-label">累计答题</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-info">
          <div class="stat-number">{{ accuracyRate }}%</div>
          <div class="stat-label">正确率</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-number">{{ answerStore.stats.correct }}</div>
          <div class="stat-label">答对题数</div>
        </div>
      </div>
    </div>

    <div class="types-section">
      <h2 class="section-title">
        <span class="title-icon">📚</span>
        选择练习类型
      </h2>

      <div v-loading="loading" class="types-grid">
        <div
          v-for="(type, index) in typesWithCount"
          :key="type.id"
          class="type-card"
          :style="{ background: getGradient(index) }"
          @click="startPractice(type.id)"
        >
          <div class="type-icon">{{ getTypeIcon(index) }}</div>
          <h3 class="type-name">{{ type.name }}</h3>
          <div class="type-count">
            <span class="count-number">{{ type.questionCount }}</span>
            <span class="count-label">道题目</span>
          </div>
          <el-button
            class="start-btn"
            type="primary"
            size="large"
            :disabled="type.questionCount === 0"
            @click.stop="startPractice(type.id)"
          >
            {{ type.questionCount === 0 ? '暂无题目' : '开始练习' }}
          </el-button>
        </div>
      </div>

      <div v-if="!loading && typesWithCount.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3 class="empty-title">还没有题目哦~</h3>
        <p class="empty-desc">请让家长在家长模式中添加题目吧！</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionStore } from '@/stores/question'
import { useAnswerStore } from '@/stores/answer'

const router = useRouter()
const questionStore = useQuestionStore()
const answerStore = useAnswerStore()

const loading = ref(true)

const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
]

const icons = ['📖', '🔢', '🌍', '🔬', '🎨', '🎵', '🏃', '🧠']

const typesWithCount = computed(() => {
  return questionStore.typesWithCount
})

const accuracyRate = computed(() => {
  if (answerStore.stats.total === 0) return 0
  return Math.round((answerStore.stats.correct / answerStore.stats.total) * 100)
})

function getGradient(index) {
  return gradients[index % gradients.length]
}

function getTypeIcon(index) {
  return icons[index % icons.length]
}

function startPractice(typeId) {
  const type = typesWithCount.value.find(t => t.id === typeId)
  if (!type || type.questionCount === 0) return
  router.push(`/student/practice?typeId=${typeId}`)
}

onMounted(async () => {
  loading.value = true
  try {
    await questionStore.fetchTypes()
    await questionStore.fetchQuestions()
    await answerStore.fetchStats()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.student-home {
  padding: 0;
}

.welcome-section {
  margin-bottom: 24px;
}

.welcome-card {
  background: linear-gradient(135deg, #fff5f8 0%, #f0f7ff 100%);
  border-radius: 20px;
  padding: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  .welcome-text {
    .welcome-title {
      font-size: 28px;
      font-weight: 700;
      color: #303133;
      margin-bottom: 8px;
    }

    .welcome-subtitle {
      font-size: 16px;
      color: #666;
    }
  }

  .welcome-icon {
    font-size: 64px;
    animation: bounce 2s ease-in-out infinite;
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

.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    font-size: 40px;
  }

  .stat-info {
    .stat-number {
      font-size: 28px;
      font-weight: 700;
      color: #303133;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 14px;
      color: #909399;
      margin-top: 4px;
    }
  }
}

.types-section {
  .section-title {
    font-size: 22px;
    font-weight: 700;
    color: #303133;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;

    .title-icon {
      font-size: 24px;
    }
  }
}

.types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.type-card {
  border-radius: 20px;
  padding: 28px 24px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.1);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);

    &::before {
      opacity: 1;
    }
  }

  .type-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .type-name {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .type-count {
    margin-bottom: 20px;
    opacity: 0.9;

    .count-number {
      font-size: 24px;
      font-weight: 700;
    }

    .count-label {
      font-size: 14px;
      margin-left: 4px;
    }
  }

  .start-btn {
    width: 100%;
    border-radius: 25px;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.25);
    border: 2px solid rgba(255, 255, 255, 0.4);
    color: #fff;
    backdrop-filter: blur(10px);

    &:hover {
      background: rgba(255, 255, 255, 0.35);
      color: #fff;
    }

    &.is-disabled {
      background: rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.6);
      border-color: rgba(255, 255, 255, 0.2);
    }
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .empty-title {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }

  .empty-desc {
    font-size: 14px;
    color: #909399;
  }
}

@media (max-width: 768px) {
  .welcome-card {
    flex-direction: column;
    text-align: center;
    gap: 16px;

    .welcome-text .welcome-title {
      font-size: 22px;
    }
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .types-grid {
    grid-template-columns: 1fr;
  }
}
</style>
