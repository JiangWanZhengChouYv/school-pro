<template>
  <div class="student-layout">
    <header class="student-header">
      <div class="header-content">
        <div class="logo-section">
          <span class="logo-icon">🎓</span>
          <span class="logo-text">学习小助手</span>
        </div>
        <div class="header-actions">
          <el-button
            type="primary"
            size="large"
            class="parent-btn"
            @click="showPasswordDialog = true"
          >
            <span class="btn-icon">👨‍👩‍👧</span>
            <span class="btn-text">家长模式</span>
          </el-button>
        </div>
      </div>
    </header>
    <main class="student-main">
      <router-view v-slot="{ Component }">
        <transition name="slide-up" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <footer class="student-footer">
      <p>© 2024 学习小助手 - 让学习更有趣 🌟</p>
    </footer>
    <PasswordDialog v-model="showPasswordDialog" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PasswordDialog from '@/components/PasswordDialog.vue'

const showPasswordDialog = ref(false)
</script>

<style scoped lang="scss">
.student-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.student-header {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.02);
    }

    .logo-icon {
      font-size: 36px;
      animation: bounce 2s ease-in-out infinite;
    }

    .logo-text {
      font-size: 24px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .parent-btn {
    border-radius: 25px;
    padding: 0 20px;
    font-weight: 600;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    height: 44px;
    min-width: 120px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    &:active {
      transform: translateY(0);
    }

    .btn-icon {
      margin-right: 6px;
      font-size: 16px;
    }
  }
}

.student-main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 24px;
}

.student-footer {
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  text-align: center;
  color: #666;
  font-size: 14px;
  backdrop-filter: blur(10px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

// 平板端适配
@media (max-width: 1200px) {
  .student-header {
    .header-content {
      padding: 14px 20px;
    }

    .logo-section {
      .logo-icon {
        font-size: 32px;
      }

      .logo-text {
        font-size: 20px;
      }
    }
  }

  .student-main {
    padding: 24px 20px;
  }
}

// 移动端适配
@media (max-width: 768px) {
  .student-header {
    .header-content {
      padding: 12px 16px;
    }

    .logo-section {
      gap: 8px;

      .logo-icon {
        font-size: 28px;
      }

      .logo-text {
        font-size: 18px;
      }
    }

    .parent-btn {
      height: 40px;
      min-width: auto;
      padding: 0 16px;
      font-size: 14px;

      .btn-text {
        display: none;
      }

      .btn-icon {
        margin-right: 0;
        font-size: 20px;
      }
    }
  }

  .student-main {
    padding: 16px;
  }

  .student-footer {
    padding: 16px;
    font-size: 12px;
  }
}

// 小屏幕适配
@media (max-width: 480px) {
  .student-header {
    .logo-section {
      .logo-text {
        font-size: 16px;
      }
    }
  }

  .student-main {
    padding: 12px;
  }
}
</style>
