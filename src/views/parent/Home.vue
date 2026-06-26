<template>
  <div class="home-dashboard" v-loading="loading">
    <div class="welcome-section">
      <h2 class="welcome-title">欢迎使用家长管理中心 👋</h2>
      <p class="welcome-desc">管理孩子的学习进度，轻松掌握学习情况</p>
    </div>

    <div class="stats-grid">
      <el-card class="stat-card stat-card-blue" shadow="hover">
        <div class="stat-content">
          <div class="stat-info">
            <div class="stat-value">{{ questionStore.totalQuestions }}</div>
            <div class="stat-label">题目总数</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="40"><Document /></el-icon>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card stat-card-green" shadow="hover">
        <div class="stat-content">
          <div class="stat-info">
            <div class="stat-value">{{ questionStore.totalTypes }}</div>
            <div class="stat-label">类型数量</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="40"><Collection /></el-icon>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card stat-card-orange" shadow="hover">
        <div class="stat-content">
          <div class="stat-info">
            <div class="stat-value">{{ answerStore.stats.total }}</div>
            <div class="stat-label">累计答题数</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="40"><EditPen /></el-icon>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card stat-card-purple" shadow="hover">
        <div class="stat-content">
          <div class="stat-info">
            <div class="stat-value">{{ correctRate }}%</div>
            <div class="stat-label">正确率</div>
          </div>
          <div class="stat-icon">
            <el-icon :size="40"><TrendCharts /></el-icon>
          </div>
        </div>
      </el-card>
    </div>

    <div class="quick-actions-section">
      <h3 class="section-title">快捷操作</h3>
      <div class="actions-grid">
        <el-card
          v-for="action in quickActions"
          :key="action.path"
          class="action-card"
          shadow="hover"
          @click="$router.push(action.path)"
        >
          <div class="action-content">
            <div class="action-icon" :style="{ backgroundColor: action.bgColor, color: action.color }">
              <el-icon :size="28">
                <component :is="action.icon" />
              </el-icon>
            </div>
            <div class="action-info">
              <div class="action-title">{{ action.title }}</div>
              <div class="action-desc">{{ action.desc }}</div>
            </div>
            <el-icon class="action-arrow"><ArrowRight /></el-icon>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Document,
  Collection,
  EditPen,
  TrendCharts,
  MagicStick,
  DataAnalysis,
  Setting,
  ArrowRight
} from '@element-plus/icons-vue'
import { useQuestionStore } from '@/stores/question'
import { useAnswerStore } from '@/stores/answer'

const questionStore = useQuestionStore()
const answerStore = useAnswerStore()

const loading = ref(true)

const correctRate = computed(() => {
  if (answerStore.stats.total === 0) return 0
  return Math.round((answerStore.stats.correct / answerStore.stats.total) * 100)
})

const quickActions = [
  {
    title: '题目管理',
    desc: '添加、编辑、删除题目',
    icon: Document,
    path: '/parent/questions',
    bgColor: '#dbeafe',
    color: '#2563eb'
  },
  {
    title: '类型管理',
    desc: '管理题目分类',
    icon: Collection,
    path: '/parent/types',
    bgColor: '#dcfce7',
    color: '#16a34a'
  },
  {
    title: 'AI出题',
    desc: '智能生成练习题',
    icon: MagicStick,
    path: '/parent/ai-generate',
    bgColor: '#fef3c7',
    color: '#d97706'
  },
  {
    title: '错题分析',
    desc: '查看错题统计分析',
    icon: DataAnalysis,
    path: '/parent/ai-analysis',
    bgColor: '#fce7f3',
    color: '#db2777'
  },
  {
    title: 'AI配置',
    desc: '配置AI参数',
    icon: Setting,
    path: '/parent/ai-config',
    bgColor: '#e0e7ff',
    color: '#4f46e5'
  }
]

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
.home-dashboard {
  padding: 0;
  animation: fadeInUp 0.4s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-section {
  margin-bottom: 28px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: #fff;

  .welcome-title {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
    color: #fff;
  }

  .welcome-desc {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;

  .stat-card {
    border: none;
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: default;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }

    :deep(.el-card__body) {
      padding: 24px;
    }

    .stat-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-info {
      .stat-value {
        font-size: 32px;
        font-weight: 700;
        line-height: 1.2;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: #6b7280;
      }
    }

    .stat-icon {
      opacity: 0.9;
      transition: transform 0.3s ease;
    }

    &:hover .stat-icon {
      transform: scale(1.1);
    }
  }

  .stat-card-blue {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    .stat-value,
    .stat-label,
    .stat-icon {
      color: #fff;
    }

    .stat-label {
      color: rgba(255, 255, 255, 0.85);
    }
  }

  .stat-card-green {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);

    .stat-value,
    .stat-label,
    .stat-icon {
      color: #fff;
    }

    .stat-label {
      color: rgba(255, 255, 255, 0.85);
    }
  }

  .stat-card-orange {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

    .stat-value,
    .stat-label,
    .stat-icon {
      color: #fff;
    }

    .stat-label {
      color: rgba(255, 255, 255, 0.85);
    }
  }

  .stat-card-purple {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

    .stat-value,
    .stat-label,
    .stat-icon {
      color: #fff;
    }

    .stat-label {
      color: rgba(255, 255, 255, 0.85);
    }
  }
}

.quick-actions-section {
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 16px;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;

    .action-card {
      cursor: pointer;
      border-radius: 12px;
      transition: all 0.3s ease;
      border: 1px solid #e5e7eb;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        border-color: #667eea;
      }

      :deep(.el-card__body) {
        padding: 20px;
      }

      .action-content {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .action-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: transform 0.3s ease;
      }

      &:hover .action-icon {
        transform: scale(1.1);
      }

      .action-info {
        flex: 1;
        min-width: 0;

        .action-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
          transition: color 0.3s ease;
        }

        .action-desc {
          font-size: 13px;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .action-arrow {
        color: #9ca3af;
        flex-shrink: 0;
        transition: all 0.3s ease;
      }

      &:hover .action-arrow {
        color: #667eea;
        transform: translateX(4px);
      }
    }
  }
}

// 平板端适配
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .welcome-section {
    padding: 20px;

    .welcome-title {
      font-size: 20px;
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .welcome-section {
    padding: 16px;
    margin-bottom: 20px;
    border-radius: 12px;

    .welcome-title {
      font-size: 18px;
    }

    .welcome-desc {
      font-size: 13px;
    }
  }

  .quick-actions-section {
    .actions-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
