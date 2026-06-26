<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="formRules"
    label-width="100px"
  >
    <el-form-item label="题目类型" prop="typeId">
      <div class="type-selector">
        <el-select
          v-model="formData.typeId"
          placeholder="请选择题目类型"
          style="flex: 1;"
          @change="handleTypeChange"
        >
          <el-option
            v-for="type in questionStore.types"
            :key="type.id"
            :label="type.name"
            :value="type.id"
          />
        </el-select>
        <el-button type="primary" plain :icon="Plus" @click="handleAddType">
          新建类型
        </el-button>
      </div>
    </el-form-item>

    <el-form-item label="题干" prop="content">
      <div class="rich-editor">
        <div class="editor-toolbar">
          <el-button-group>
            <el-button
              size="small"
              class="format-btn bold-btn"
              @click="execFormat('bold')"
              title="加粗"
            >
              <strong>B</strong>
            </el-button>
            <el-button
              size="small"
              class="format-btn italic-btn"
              @click="execFormat('italic')"
              title="斜体"
            >
              <em>I</em>
            </el-button>
            <el-button
              size="small"
              :icon="List"
              @click="execFormat('insertUnorderedList')"
              title="无序列表"
            />
          </el-button-group>
          <el-upload
            :show-file-list="false"
            :before-upload="handleImageUpload"
            accept="image/*"
          >
            <el-button size="small" :icon="Picture" title="插入图片">
              插入图片
            </el-button>
          </el-upload>
        </div>
        <div
          ref="editorRef"
          class="editor-content"
          contenteditable="true"
          @input="handleEditorInput"
          @blur="handleEditorBlur"
        />
      </div>
    </el-form-item>

    <el-form-item label="答案类型" prop="answerType">
      <el-radio-group v-model="formData.answerType" @change="handleAnswerTypeChange">
        <el-radio value="text">文本答案</el-radio>
        <el-radio value="choice">选择题</el-radio>
        <el-radio value="image">图片答案</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item
      v-if="formData.answerType === 'text'"
      label="答案内容"
      prop="answerText"
    >
      <el-input
        v-model="formData.answerText"
        type="textarea"
        :rows="4"
        placeholder="请输入答案内容"
      />
    </el-form-item>

    <el-form-item
      v-if="formData.answerType === 'choice'"
      label="选项列表"
      prop="options"
    >
      <div class="options-list">
        <div
          v-for="(option, index) in formData.options"
          :key="index"
          class="option-item"
        >
          <el-radio
            v-model="formData.correctIndex"
            :value="index"
            @change="validateOptions"
          >
            正确答案
          </el-radio>
          <el-input
            v-model="option.text"
            :placeholder="`选项 ${String.fromCharCode(65 + index)}`"
            style="flex: 1; margin: 0 8px;"
            @input="validateOptions"
          />
          <el-button
            type="danger"
            :icon="Delete"
            circle
            size="small"
            :disabled="formData.options.length <= 2"
            @click="removeOption(index)"
          />
        </div>
        <el-button type="primary" plain :icon="Plus" @click="addOption">
          添加选项
        </el-button>
      </div>
    </el-form-item>

    <el-form-item
      v-if="formData.answerType === 'image'"
      label="答案图片"
      prop="answerImage"
    >
      <el-upload
        :show-file-list="false"
        :before-upload="handleAnswerImageUpload"
        accept="image/*"
      >
        <div v-if="formData.answerImage" class="image-preview">
          <img :src="formData.answerImage" alt="答案图片" />
          <div class="image-mask">
            <el-icon><Refresh /></el-icon>
            <span>点击更换</span>
          </div>
        </div>
        <el-button v-else type="primary" plain :icon="Picture">
          上传答案图片
        </el-button>
      </el-upload>
    </el-form-item>
  </el-form>

  <el-dialog v-model="typeDialogVisible" title="新建类型" width="400px">
    <el-form :model="newTypeForm" label-width="80px">
      <el-form-item label="类型名称">
        <el-input
          v-model="newTypeForm.name"
          placeholder="请输入类型名称"
          maxlength="20"
          show-word-limit
          @keyup.enter="handleConfirmAddType"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="typeDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="typeSubmitLoading" @click="handleConfirmAddType">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Plus,
  Delete,
  Picture,
  List,
  Refresh
} from '@element-plus/icons-vue'
import { useQuestionStore } from '@/stores/question'
import { fileToBase64, compressImage } from '@/utils/imageUtils'

const props = defineProps({
  questionData: {
    type: Object,
    default: null
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'validate-change'])

const questionStore = useQuestionStore()

const formRef = ref(null)
const editorRef = ref(null)
const typeDialogVisible = ref(false)
const typeSubmitLoading = ref(false)
const newTypeForm = reactive({
  name: ''
})

const formData = reactive({
  typeId: null,
  content: '',
  answerType: 'text',
  answerText: '',
  options: [
    { text: '' },
    { text: '' },
    { text: '' },
    { text: '' }
  ],
  correctIndex: 0,
  answerImage: ''
})

const formRules = {
  typeId: [
    { required: true, message: '请选择题目类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入题干内容', trigger: 'blur' }
  ],
  answerType: [
    { required: true, message: '请选择答案类型', trigger: 'change' }
  ],
  answerText: [
    { required: true, message: '请输入答案内容', trigger: 'blur' }
  ],
  answerImage: [
    { required: true, message: '请上传答案图片', trigger: 'change' }
  ]
}

function initFormData(data) {
  if (data) {
    formData.typeId = data.typeId
    formData.content = data.content || ''
    formData.answerType = data.answerType || 'text'
    formData.answerText = data.answerText || ''
    formData.options = data.options && data.options.length > 0
      ? JSON.parse(JSON.stringify(data.options))
      : [{ text: '' }, { text: '' }, { text: '' }, { text: '' }]
    formData.correctIndex = data.correctIndex ?? 0
    formData.answerImage = data.answerImage || ''
  } else {
    formData.typeId = null
    formData.content = ''
    formData.answerType = 'text'
    formData.answerText = ''
    formData.options = [{ text: '' }, { text: '' }, { text: '' }, { text: '' }]
    formData.correctIndex = 0
    formData.answerImage = ''
  }
  nextTick(() => {
    if (editorRef.value) {
      editorRef.value.innerHTML = formData.content || ''
    }
  })
}

function handleTypeChange() {
  validateField('typeId')
}

function handleEditorInput() {
  if (editorRef.value) {
    formData.content = editorRef.value.innerHTML
    validateField('content')
  }
}

function handleEditorBlur() {
  if (editorRef.value) {
    formData.content = editorRef.value.innerHTML
    validateField('content')
  }
}

function execFormat(command) {
  document.execCommand(command, false, null)
  handleEditorInput()
}

async function handleImageUpload(file) {
  try {
    const base64 = await fileToBase64(file)
    const compressed = await compressImage(base64, 600, 0.8)
    document.execCommand('insertImage', false, compressed)
    handleEditorInput()
  } catch (err) {
    ElMessage.error('图片插入失败')
  }
  return false
}

async function handleAnswerImageUpload(file) {
  try {
    const base64 = await fileToBase64(file)
    const compressed = await compressImage(base64, 600, 0.8)
    formData.answerImage = compressed
    validateField('answerImage')
  } catch (err) {
    ElMessage.error('图片上传失败')
  }
  return false
}

function handleAnswerTypeChange() {
  validateField('answerType')
  if (formData.answerType === 'text') {
    validateField('answerText')
  } else if (formData.answerType === 'choice') {
    validateOptions()
  } else if (formData.answerType === 'image') {
    validateField('answerImage')
  }
}

function addOption() {
  formData.options.push({ text: '' })
}

function removeOption(index) {
  if (formData.options.length <= 2) return
  formData.options.splice(index, 1)
  if (formData.correctIndex >= formData.options.length) {
    formData.correctIndex = formData.options.length - 1
  }
  validateOptions()
}

function validateOptions() {
  if (!formRef.value) return
  const hasEmpty = formData.options.some(opt => !opt.text.trim())
  if (hasEmpty) {
    formRef.value.setValidateError('options', '请填写所有选项内容')
    emit('validate-change', false)
  } else {
    formRef.value.clearValidate('options')
    emit('validate-change', true)
  }
}

function validateField(prop) {
  if (!formRef.value) return
  formRef.value.validateField(prop, (error) => {
    emit('validate-change', !error)
  })
}

function handleAddType() {
  newTypeForm.name = ''
  typeDialogVisible.value = true
}

async function handleConfirmAddType() {
  if (!newTypeForm.name.trim()) {
    ElMessage.warning('请输入类型名称')
    return
  }
  typeSubmitLoading.value = true
  try {
    const id = await questionStore.addType(newTypeForm.name.trim())
    formData.typeId = id
    ElMessage.success('类型创建成功')
    typeDialogVisible.value = false
    validateField('typeId')
  } catch (err) {
    ElMessage.error(err.message || '创建失败')
  } finally {
    typeSubmitLoading.value = false
  }
}

async function validateForm() {
  if (!formRef.value) return false
  try {
    await formRef.value.validate()
    if (formData.answerType === 'choice') {
      const hasEmpty = formData.options.some(opt => !opt.text.trim())
      if (hasEmpty) {
        ElMessage.warning('请填写所有选项内容')
        return false
      }
    }
    return true
  } catch {
    return false
  }
}

function getSubmitData() {
  const data = {
    typeId: formData.typeId,
    content: formData.content,
    answerType: formData.answerType
  }

  if (formData.answerType === 'text') {
    data.answerText = formData.answerText
  } else if (formData.answerType === 'choice') {
    data.options = formData.options
    data.correctIndex = formData.correctIndex
  } else if (formData.answerType === 'image') {
    data.answerImage = formData.answerImage
  }

  return data
}

function resetForm() {
  initFormData(null)
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

defineExpose({
  validateForm,
  getSubmitData,
  resetForm,
  initFormData
})

watch(() => props.questionData, (newVal) => {
  initFormData(newVal)
}, { immediate: true })

onMounted(async () => {
  if (questionStore.types.length === 0) {
    await questionStore.fetchTypes()
  }
})
</script>

<style scoped lang="scss">
.type-selector {
  display: flex;
  gap: 8px;
  width: 100%;
}

.rich-editor {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;

  .editor-toolbar {
    display: flex;
    gap: 8px;
    padding: 8px;
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    align-items: center;

    .format-btn {
      min-width: 32px;
      padding: 0 8px;

      &.bold-btn strong {
        font-weight: 700;
      }

      &.italic-btn em {
        font-style: italic;
      }
    }
  }

  .editor-content {
    min-height: 200px;
    padding: 12px;
    outline: none;
    font-size: 14px;
    line-height: 1.6;

    &:empty::before {
      content: '请输入题干内容...';
      color: #c0c4cc;
    }

    img {
      max-width: 100%;
      height: auto;
    }
  }
}

.options-list {
  width: 100%;

  .option-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }
}

.image-preview {
  position: relative;
  width: 200px;
  height: 200px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .image-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
    gap: 4px;

    .el-icon {
      font-size: 24px;
    }
  }

  &:hover .image-mask {
    opacity: 1;
  }
}
</style>
