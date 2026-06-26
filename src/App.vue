<template>
  <div id="app">
    <el-menu :default-active="activeIndex" mode="horizontal" router>
      <el-menu-item index="/">学生首页</el-menu-item>
      <el-menu-item index="/student/practice">答题练习</el-menu-item>
      <el-menu-item index="/parent">家长首页</el-menu-item>
    </el-menu>
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeIndex = computed(() => route.path)
</script>

<style lang="scss">
#app {
  width: 100%;
  min-height: 100vh;
}

.el-menu {
  margin-bottom: 20px;
}
</style>
