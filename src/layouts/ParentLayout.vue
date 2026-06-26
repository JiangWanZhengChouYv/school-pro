<template>
  <el-container class="parent-layout">
    <el-aside :width="isCollapse ? '64px' : '240px'" class="parent-aside" :class="{ 'is-collapse': isCollapse }">
      <div class="aside-logo">
        <span class="logo-icon">👨‍👩‍👧</span>
        <span class="logo-text" v-show="!isCollapse">家长管理中心</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        :collapse="isCollapse"
        :collapse-transition="false"
        class="parent-menu"
        background-color="#1f2937"
        text-color="#d1d5db"
        active-text-color="#ffffff"
      >
        <el-menu-item index="/parent">
          <el-icon><House /></el-icon>
          <template #title>家长首页</template>
        </el-menu-item>
        <el-menu-item index="/parent/questions">
          <el-icon><Document /></el-icon>
          <template #title>题目管理</template>
        </el-menu-item>
        <el-menu-item index="/parent/types">
          <el-icon><Collection /></el-icon>
          <template #title>类型管理</template>
        </el-menu-item>
        <el-menu-item index="/parent/ai-generate">
          <el-icon><MagicStick /></el-icon>
          <template #title>AI出题</template>
        </el-menu-item>
        <el-menu-item index="/parent/ai-analysis">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>错题分析</template>
        </el-menu-item>
        <el-menu-item index="/parent/ai-config">
          <el-icon><Setting /></el-icon>
          <template #title>AI配置</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container class="main-container">
      <el-header class="parent-header">
        <div class="header-left">
          <el-button class="collapse-btn" text @click="toggleCollapse">
            <el-icon :size="20">
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
          </el-button>
          <span class="header-title">{{ currentPageTitle }}</span>
        </div>
        <div class="header-right">
          <el-button type="primary" plain @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            <span class="btn-text">返回学生模式</span>
          </el-button>
        </div>
      </el-header>
      <el-main class="parent-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  House,
  Document,
  Collection,
  MagicStick,
  DataAnalysis,
  Setting,
  SwitchButton,
  Fold,
  Expand
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isCollapse = ref(false)

const activeMenu = computed(() => route.path)

const currentPageTitle = computed(() => {
  const titles = {
    '/parent': '家长首页',
    '/parent/questions': '题目管理',
    '/parent/types': '类型管理',
    '/parent/ai-generate': 'AI出题',
    '/parent/ai-analysis': '错题分析',
    '/parent/ai-config': 'AI配置'
  }
  return titles[route.path] || '家长管理中心'
})

function toggleCollapse() {
  isCollapse.value = !isCollapse.value
}

function handleLogout() {
  authStore.logout()
  ElMessage.success('已退出家长模式')
  router.push('/')
}

function handleResize() {
  if (window.innerWidth < 768) {
    isCollapse.value = true
  } else if (window.innerWidth >= 1200) {
    isCollapse.value = false
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.parent-layout {
  height: 100vh;
  transition: all 0.3s ease;
}

.parent-aside {
  background-color: #1f2937;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.3s ease;

  &.is-collapse {
    .aside-logo {
      justify-content: center;
      padding: 20px 10px;
    }
  }

  .aside-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px;
    border-bottom: 1px solid #374151;
    transition: all 0.3s ease;

    .logo-icon {
      font-size: 28px;
      flex-shrink: 0;
    }

    .logo-text {
      color: #fff;
      font-size: 18px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
    }
  }

  .parent-menu {
    flex: 1;
    border-right: none;
    overflow-x: hidden;

    :deep(.el-menu-item) {
      height: 50px;
      line-height: 50px;
      transition: all 0.2s ease;

      &:hover {
        background-color: #374151;
      }

      &.is-active {
        background-color: #4f46e5;
      }
    }
  }
}

.main-container {
  transition: all 0.3s ease;
}

.parent-header {
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 60px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  z-index: 10;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .collapse-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      color: #6b7280;
      transition: all 0.2s ease;

      &:hover {
        background-color: #f3f4f6;
        color: #1f2937;
      }
    }

    .header-title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }
  }

  .header-right {
    .el-button {
      border-radius: 8px;
      transition: all 0.2s ease;
    }
  }
}

.parent-main {
  background-color: #f3f4f6;
  padding: 24px;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 平板端适配
@media (max-width: 1200px) {
  .parent-main {
    padding: 20px;
  }
}

// 移动端适配
@media (max-width: 768px) {
  .parent-header {
    padding: 0 16px;
    height: 56px;

    .header-left {
      .header-title {
        font-size: 16px;
      }
    }

    .header-right {
      .el-button {
        padding: 8px 12px;
        font-size: 13px;

        .btn-text {
          display: none;
        }
      }
    }
  }

  .parent-main {
    padding: 16px;
  }
}

// 小屏幕适配
@media (max-width: 480px) {
  .parent-header {
    .header-left {
      .header-title {
        font-size: 14px;
      }
    }
  }

  .parent-main {
    padding: 12px;
  }
}
</style>
