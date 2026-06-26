<template>
  <div class="page-container">
    <h1 class="page-title">题目类型管理</h1>
    <el-card class="content-card">
      <div class="toolbar">
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          新增类型
        </el-button>
      </div>

      <el-table
        v-loading="questionStore.loading"
        :data="questionStore.typesWithCount"
        style="width: 100%"
        empty-text="暂无类型数据"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="类型名称" />
        <el-table-column prop="questionCount" label="题目数量" width="120" />
        <el-table-column label="创建时间" width="200">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!questionStore.loading && questionStore.typesWithCount.length === 0"
        description="暂无类型，点击上方按钮添加"
        style="margin-top: 40px;"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增类型" width="400px">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="类型名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入类型名称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { useQuestionStore } from '@/stores/question'

const questionStore = useQuestionStore()

const dialogVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)
const formData = ref({
  name: ''
})

const formRules = {
  name: [
    { required: true, message: '请输入类型名称', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ]
}

function formatDate(timestamp) {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

function handleAdd() {
  formData.value.name = ''
  dialogVisible.value = true
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    submitLoading.value = true
    try {
      await questionStore.addType(formData.value.name.trim())
      ElMessage.success('添加成功')
      dialogVisible.value = false
    } catch (err) {
      ElMessage.error(err.message || '添加失败')
    }
  } catch {
  } finally {
    submitLoading.value = false
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `确定要删除类型"${row.name}"吗？该类型下的所有题目也会被删除，此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await questionStore.removeType(row.id)
    ElMessage.success('删除成功')
  } catch {
  }
}

onMounted(async () => {
  await questionStore.fetchTypes()
  await questionStore.fetchQuestions()
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 0;
}

.content-card {
  .toolbar {
    margin-bottom: 16px;
  }
}
</style>
