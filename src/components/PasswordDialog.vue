<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="400px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item
        v-if="!hasPwd"
        label="设置密码"
        prop="password"
      >
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入家长密码"
          show-password
          @keyup.enter="handleSubmit"
        />
      </el-form-item>
      <el-form-item
        v-if="!hasPwd"
        label="确认密码"
        prop="confirmPassword"
      >
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          show-password
          @keyup.enter="handleSubmit"
        />
      </el-form-item>
      <el-form-item
        v-else
        label="家长密码"
        prop="password"
      >
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入家长密码"
          show-password
          @keyup.enter="handleSubmit"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">
        {{ hasPwd ? '确认' : '设置并进入' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'success'])

const router = useRouter()
const authStore = useAuthStore()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const hasPwd = computed(() => authStore.hasPassword())

const dialogTitle = computed(() => {
  return hasPwd.value ? '输入家长密码' : '设置家长密码'
})

const formRef = ref(null)
const form = ref({
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.value.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = computed(() => ({
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 4, message: '密码长度不能少于4位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}))

watch(() => props.visible, (val) => {
  if (val) {
    form.value = {
      password: '',
      confirmPassword: ''
    }
    if (formRef.value) {
      formRef.value.clearValidate()
    }
  }
})

function handleSubmit() {
  formRef.value?.validate((valid) => {
    if (!valid) return

    if (!hasPwd.value) {
      authStore.setPassword(form.value.password)
      authStore.login(form.value.password)
      ElMessage.success('密码设置成功，已进入家长模式')
      dialogVisible.value = false
      emit('success')
      router.push('/parent')
    } else {
      const success = authStore.login(form.value.password)
      if (success) {
        ElMessage.success('验证成功，已进入家长模式')
        dialogVisible.value = false
        emit('success')
        router.push('/parent')
      } else {
        ElMessage.error('密码错误，请重试')
      }
    }
  })
}

function handleClosed() {
  form.value = {
    password: '',
    confirmPassword: ''
  }
  formRef.value?.clearValidate()
}
</script>
