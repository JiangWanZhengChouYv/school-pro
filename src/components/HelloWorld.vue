<template>
  <div class="hello-world">
    <h2>{{ msg }}</h2>
  </div>
</template>

<script setup>
defineProps({
  msg: {
    type: String,
    default: 'Hello World'
  }
})
</script>

<style scoped lang="scss">
.hello-world {
  text-align: center;
  padding: 20px;
}
</style>
