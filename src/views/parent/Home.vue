<template>
  <div class="page-container">
    <h1 class="page-title">家长模式首页</h1>
    <el-card>
      <p>家长模式首页内容</p>
      <div style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
        <el-button type="primary" @click="$router.push('/parent/questions')">题目管理</el-button>
        <el-button type="success" @click="$router.push('/parent/types')">类型管理</el-button>
        <el-button type="warning" @click="$router.push('/parent/ai-config')">AI配置</el-button>
        <el-button type="danger" @click="$router.push('/parent/ai-generate')">AI出题</el-button>
        <el-button type="info" @click="$router.push('/parent/ai-analysis')">错题分析</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
</script>

<style scoped lang="scss">
</style>
