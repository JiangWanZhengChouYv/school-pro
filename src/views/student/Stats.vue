<template>
  <div class="stats-page">
    <div class="page-header">
      <el-button :icon="ArrowLeft" circle @click="goHome">返回</el-button>
      <h1 class="page-title">
        <span class="title-icon">📊</span>
        我的成绩
      </h1>
      <div></div>
    </div>

    <div v-loading="loading" class="stats-content">
      <div class="section">
        <h2 class="section-title">
          <span class="title-icon">📈</span>
          总体统计
        </h2>
        <div class="overview-cards">
          <div class="overview-card total-card">
            <div class="card-icon">📝</div>
            <div class="card-info">
              <div class="card-number">{{ answerStore.stats.total }}</div>
              <div class="card-label">累计答题</div>
            </div>
          </div>
          <div class="overview-card correct-card">
            <div class="card-icon">✅</div>
            <div class="card-info">
              <div class="card-number">{{ answerStore.stats.correct }}</div>
              <div class="card-label">答对题数</div>
            </div>
          </div>
          <div class="overview-card wrong-card">
            <div class="card-icon">❌</div>
            <div class="card-info">
              <div class="card-number">{{ answerStore.stats.wrong }}</div>
              <div class="card-label">答错题数</div>
            </div>
          </div>
          <div class="overview-card accuracy-card">
            <div class="card-icon">🎯</div>
            <div class="card-info">
              <div class="card-number">{{ answerStore.accuracyRate }}%</div>
              <div class="card-label">总正确率</div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">
          <span class="title-icon">📚</span>
          按类型统计
        </h2>
        <div class="type-stats">
          <div v-if="typeStatsList.length === 0" class="empty-tip">
            <span class="empty-icon">📭</span>
            暂无数据，快去答题吧！
          </div>
          <div
            v-for="(item, index) in typeStatsList"
            :key="item.typeId"
            class="type-stat-item"
          >
            <div class="type-header">
              <span class="type-name">
                <span class="type-icon">{{ getTypeIcon(index) }}</span>
                {{ item.typeName }}
              </span>
              <span class="type-count">
                {{ item.total }} 题 · 正确率 {{ item.accuracy }}%
              </span>
            </div>
            <div class="progress-bar-wrap">
              <div class="progress-bar-bg">
                <div
                  class="progress-bar-fill"
                  :style="{
                    width: item.accuracy + '%',
                    background: getGradient(index)
                  }"
                ></div>
              </div>
              <div class="progress-info">
                <span class="correct-count">
                  <span class="dot correct-dot"></span>
                  答对 {{ item.correct }}
                </span>
                <span class="wrong-count">
                  <span class="dot wrong-dot"></span>
                  答错 {{ item.wrong }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">
          <span class="title-icon">📅</span>
          最近7天答题趋势
        </h2>
        <div class="chart-container">
          <div class="chart-bars">
            <div
              v-for="(day, index) in weekStats"
              :key="day.date"
              class="bar-column"
            >
              <div class="bar-wrap">
                <div
                  class="bar correct-bar"
                  :style="{ height: getCorrectBarHeight(day) + '%' }"
                  :title="`答对: ${day.correct}`"
                ></div>
                <div
                  class="bar wrong-bar"
                  :style="{ height: getWrongBarHeight(day) + '%' }"
                  :title="`答错: ${day.wrong}`"
                ></div>
              </div>
              <div class="bar-label">{{ day.dayLabel }}</div>
              <div class="bar-count">{{ day.total }}</div>
            </div>
          </div>
          <div class="chart-legend">
            <span class="legend-item">
              <span class="legend-dot correct-dot"></span>
              答对
            </span>
            <span class="legend-item">
              <span class="legend-dot wrong-dot"></span>
              答错
            </span>
            <span class="legend-tip">单位：题</span>
          </div>
        </div>
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

const typeStatsList = computed(() => {
  const byType = answerStore.stats.byType || {}
  const types = questionStore.types
  return types.map((type, index) => {
    const stat = byType[type.id] || { total: 0, correct: 0, wrong: 0, accuracy: 0 }
    return {
      typeId: type.id,
      typeName: type.name,
      gradientIndex: index,
      ...stat
    }
  }).filter(item => item.total > 0)
})

const weekStats = computed(() => {
  return answerStore.getStatsByDate(7)
})

const maxDayTotal = computed(() => {
  const max = Math.max(...weekStats.value.map(d => d.total), 1)
  return max
})

function getGradient(index) {
  return gradients[index % gradients.length]
}

function getTypeIcon(index) {
  return icons[index % icons.length]
}

function getCorrectBarHeight(day) {
  if (maxDayTotal.value === 0) return 0
  return (day.correct / maxDayTotal.value) * 100
}

function getWrongBarHeight(day) {
  if (maxDayTotal.value === 0) return 0
  return (day.wrong / maxDayTotal.value) * 100
}

function goHome() {
  router.push('/')
}

onMounted(async () => {
  loading.value = true
  try {
    await questionStore.fetchTypes()
    await answerStore.fetchStats()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.stats-page {
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
    justify-content: center;

    .title-icon {
      font-size: 28px;
    }
  }
}

.stats-content {
  .section {
    margin-bottom: 28px;
  }

  .section-title {
    font-size: 20px;
    font-weight: 700;
    color: #303133;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;

    .title-icon {
      font-size: 22px;
    }
  }
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.overview-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .card-icon {
    font-size: 40px;
    flex-shrink: 0;
  }

  .card-info {
    .card-number {
      font-size: 28px;
      font-weight: 700;
      color: #303133;
      line-height: 1.2;
    }

    .card-label {
      font-size: 14px;
      color: #909399;
      margin-top: 4px;
    }
  }

  &.total-card::before {
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  }

  &.correct-card::before {
    background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
  }

  &.wrong-card::before {
    background: linear-gradient(90deg, #f5576c 0%, #f093fb 100%);
  }

  &.accuracy-card::before {
    background: linear-gradient(90deg, #fa709a 0%, #fee140 100%);
  }
}

.type-stats {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);

  .empty-tip {
    text-align: center;
    padding: 40px 20px;
    color: #909399;
    font-size: 15px;

    .empty-icon {
      font-size: 40px;
      display: block;
      margin-bottom: 12px;
    }
  }
}

.type-stat-item {
  padding: 16px 0;
  border-bottom: 1px solid #f0f2f5;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }

  .type-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .type-name {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      display: flex;
      align-items: center;
      gap: 8px;

      .type-icon {
        font-size: 20px;
      }
    }

    .type-count {
      font-size: 13px;
      color: #666;
    }
  }

  .progress-bar-wrap {
    .progress-bar-bg {
      height: 12px;
      background: #f0f2f5;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progress-bar-fill {
      height: 100%;
      border-radius: 6px;
      transition: width 0.5s ease;
    }

    .progress-info {
      display: flex;
      gap: 20px;
      font-size: 12px;
      color: #909399;

      .dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 4px;
      }

      .correct-dot {
        background: #67c23a;
      }

      .wrong-dot {
        background: #f56c6c;
      }
    }
  }
}

.chart-container {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);

  .chart-bars {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    height: 200px;
    padding: 0 10px;
    margin-bottom: 16px;
    border-bottom: 2px solid #f0f2f5;
  }

  .bar-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    max-width: 60px;

    .bar-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      height: 170px;
      width: 100%;
      gap: 2px;
    }

    .bar {
      width: 24px;
      border-radius: 4px 4px 0 0;
      transition: height 0.5s ease;
      min-height: 2px;

      &.correct-bar {
        background: linear-gradient(180deg, #67c23a 0%, #43e97b 100%);
      }

      &.wrong-bar {
        background: linear-gradient(180deg, #f56c6c 0%, #f093fb 100%);
      }
    }

    .bar-label {
      font-size: 12px;
      color: #666;
      margin-top: 8px;
      font-weight: 500;
    }

    .bar-count {
      font-size: 11px;
      color: #909399;
      margin-top: 2px;
    }
  }

  .chart-legend {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 24px;
    padding-top: 8px;

    .legend-item {
      font-size: 13px;
      color: #666;
      display: flex;
      align-items: center;
      gap: 6px;

      .legend-dot {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 3px;
      }

      .correct-dot {
        background: linear-gradient(180deg, #67c23a 0%, #43e97b 100%);
      }

      .wrong-dot {
        background: linear-gradient(180deg, #f56c6c 0%, #f093fb 100%);
      }
    }

    .legend-tip {
      font-size: 12px;
      color: #909399;
      margin-left: auto;
    }
  }
}

@media (max-width: 768px) {
  .page-header {
    .page-title {
      font-size: 20px;
    }
  }

  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .overview-card {
    padding: 16px;

    .card-icon {
      font-size: 32px;
    }

    .card-info {
      .card-number {
        font-size: 22px;
      }

      .card-label {
        font-size: 12px;
      }
    }
  }

  .chart-container {
    .chart-bars {
      height: 160px;
    }

    .bar-column {
      .bar-wrap {
        height: 130px;
      }

      .bar {
        width: 18px;
      }
    }
  }
}
</style>
