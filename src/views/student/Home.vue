<template>
  <div class="page-container">
    <h1 class="page-title">学生模式首页</h1>
    <el-card>
      <p>欢迎使用学生练习系统</p>
      <el-button type="primary" @click="goToPractice">开始练习</el-button>
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goToPractice() {
  router.push('/student/practice')
}
</script>

<style scoped lang="scss">
</style>
