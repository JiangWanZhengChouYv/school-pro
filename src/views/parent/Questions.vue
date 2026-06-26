<template>
  <div class="page-container">
    <h1 class="page-title">题目管理</h1>
    <el-card class="content-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            新增题目
          </el-button>
          <el-select
            v-model="selectedTypeId"
            placeholder="类型筛选"
            clearable
            style="width: 180px; margin-left: 12px;"
            @change="handleTypeFilter"
          >
            <el-option label="全部类型" :value="null" />
            <el-option
              v-for="type in questionStore.types"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            />
          </el-select>
        </div>
        <div class="toolbar-right">
          <el-input
            v-model="searchInput"
            placeholder="搜索题干内容"
            clearable
            style="width: 280px;"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button
            type="primary"
            plain
            style="margin-left: 8px;"
            @click="handleSearch"
          >
            搜索
          </el-button>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table
          v-loading="questionStore.loading"
          :data="questionStore.paginatedQuestions"
          style="width: 100%"
          empty-text="暂无题目数据"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column label="题目类型" width="150">
            <template #default="{ row }">
              <el-tag size="small">
                {{ questionStore.getTypeById(row.typeId) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="题干" min-width="300">
            <template #default="{ row }">
              <div class="question-content" v-html="truncateHtml(row.content, 50)" />
            </template>
          </el-table-column>
          <el-table-column label="答案类型" width="120">
            <template #default="{ row }">
              {{ getAnswerTypeText(row.answerType) }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link :icon="Edit" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="questionStore.currentPage"
          v-model:page-size="questionStore.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="questionStore.totalFiltered"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <el-empty
        v-if="!questionStore.loading && questionStore.totalFiltered === 0 && questionStore.questions.length > 0"
        description="未找到匹配的题目，试试其他关键词"
        style="margin-top: 40px;"
      />
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑题目' : '新增题目'"
      width="700px"
      :close-on-click-modal="false"
      @closed="handleDialogClosed"
    >
      <QuestionForm
        ref="questionFormRef"
        :question-data="currentQuestion"
        :is-edit="isEdit"
      />
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
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue'
import { useQuestionStore } from '@/stores/question'
import QuestionForm from '@/components/QuestionForm.vue'

const questionStore = useQuestionStore()

const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const currentQuestion = ref(null)
const questionFormRef = ref(null)
const searchInput = ref('')
const selectedTypeId = ref(null)

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

function getAnswerTypeText(type) {
  const map = {
    text: '文本答案',
    choice: '选择题',
    image: '图片答案'
  }
  return map[type] || '-'
}

function truncateHtml(html, maxLength) {
  if (!html) return ''
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  const text = tmp.textContent || tmp.innerText || ''
  if (text.length <= maxLength) return html
  let result = ''
  let charCount = 0
  function traverse(node) {
    if (charCount >= maxLength) return
    if (node.nodeType === Node.TEXT_NODE) {
      const remaining = maxLength - charCount
      const text = node.textContent.slice(0, remaining)
      result += text
      charCount += text.length
      if (charCount >= maxLength) {
        result += '...'
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase()
      result += `<${tag}>`
      for (const child of node.childNodes) {
        traverse(child)
        if (charCount >= maxLength) break
      }
      if (charCount >= maxLength && tag === 'p') {
        result += '...'
      }
      result += `</${tag}>`
    }
  }
  for (const child of tmp.childNodes) {
    traverse(child)
    if (charCount >= maxLength) break
  }
  if (charCount >= maxLength && !result.endsWith('...')) {
    result += '...'
  }
  return result
}

function handleAdd() {
  isEdit.value = false
  currentQuestion.value = null
  dialogVisible.value = true
}

function handleEdit(row) {
  isEdit.value = true
  currentQuestion.value = { ...row }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!questionFormRef.value) return
  const valid = await questionFormRef.value.validateForm()
  if (!valid) return
  submitLoading.value = true
  try {
    const data = questionFormRef.value.getSubmitData()
    if (isEdit.value && currentQuestion.value) {
      await questionStore.updateQuestion(currentQuestion.value.id, data)
      ElMessage.success('更新成功')
    } else {
      await questionStore.addQuestion(data)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
  } catch (err) {
    ElMessage.error(err.message || '操作失败')
  } finally {
    submitLoading.value = false
  }
}

function handleDialogClosed() {
  if (questionFormRef.value) {
    questionFormRef.value.resetForm()
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      '确定要删除这道题目吗？此操作不可恢复。',
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await questionStore.removeQuestion(row.id)
    ElMessage.success('删除成功')
  } catch {
  }
}

function handleSearch() {
  questionStore.setSearchKeyword(searchInput.value)
}

function handleTypeFilter(value) {
  selectedTypeId.value = value
  questionStore.setFilterTypeId(value)
}

function handleSizeChange(size) {
  questionStore.setPageSize(size)
}

function handleCurrentChange(page) {
  questionStore.setCurrentPage(page)
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
  :deep(.el-card__body) {
    padding: 20px;
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 12px;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .toolbar-right {
      flex: 1;
      justify-content: flex-end;

      .el-input {
        flex: 1;
        max-width: 280px;
      }
    }
  }
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  .el-table {
    min-width: 700px;
  }
}

.question-content {
  line-height: 1.5;
  font-size: 14px;
  color: #606266;
  word-break: break-word;

  :deep(img) {
    max-width: 100px;
    max-height: 60px;
    vertical-align: middle;
  }

  :deep(p) {
    margin: 0;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

// 平板端适配
@media (max-width: 1024px) {
  .content-card {
    .toolbar {
      .toolbar-right {
        width: 100%;
        justify-content: flex-start;

        .el-input {
          max-width: none;
          flex: 1;
        }
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .content-card {
    :deep(.el-card__body) {
      padding: 16px;
    }

    .toolbar {
      flex-direction: column;
      align-items: stretch;

      .toolbar-left,
      .toolbar-right {
        width: 100%;
      }

      .toolbar-right {
        .el-input {
          width: 100%;
        }
      }
    }
  }

  .pagination-wrapper {
    justify-content: center;
  }
}
</style>
