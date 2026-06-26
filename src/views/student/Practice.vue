<template>
  <div class="practice-page">
    <div v-if="showResult" class="result-container">
      <div class="result-card">
        <div class="result-icon">{{ scoreEmoji}}</div>
        <h2 class="result-title">练习完成！</h2>
        <div class="score-section">
          <div class="score-circle">
            <span class="score-number">{{ resultData.accuracy }}%</span>
            <span class="score-label">正确率</span>
          </div>
        </div>
        <div class="result-stats">
          <div class="result-stat correct">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-value">{{ resultData.correct }}</div>
              <div class="stat-text">答对</div>
            </div>
          </div>
          <div class="result-stat wrong">
            <div class="stat-icon">❌</div>
            <div class="stat-content">
              <div class="stat-value">{{ resultData.wrong }}</div>
              <div class="stat-text">答错</div>
            </div>
          </div>
          <div class="result-stat total">
            <div class="stat-icon">📝</div>
            <div class="stat-content">
              <div class="stat-value">{{ resultData.total }}</div>
              <div class="stat-text">总题数</div>
            </div>
          </div>
        </div>
        <div class="result-actions">
          <el-button size="large" class="action-btn wrong-btn" @click="goHome">
          <span class="btn-icon">🏠</span>
          返回首页
          </el-button>
          <el-button size="large" class="action-btn retry-btn" @click="showWrongList">
          <span class="btn-icon">📖</span>
          查看错题
          </el-button>
          <el-button size="large" class="action-btn primary-btn" @click="restartPractice">
          <span class="btn-icon">🔄</span>
          再来一次
          </el-button>
        </div>
      </div>
    </div>

    <div v-if="showWrongAnswers" class="wrong-list-container">
      <div class="wrong-list-header">
        <el-button :icon="ArrowLeft" @click="backToResult">返回结果</el-button>
        <h2 class="wrong-list-title">错题回顾</h2>
        <div></div>
      </div>
      <div class="wrong-questions">
        <div v-for="(item, index) in wrongAnswers" :key="item.question.id" class="wrong-question-card">
          <div class="wrong-question-header">
            <span class="wrong-index">第 {{ index + 1 }} 题</span>
            <span class="wrong-tag">答错了</span>
          </div>
          <div class="question-content" v-html="item.question.content"></div>
          <div class="answer-comparison">
            <div class="answer-item wrong-answer">
              <div class="answer-label">你的答案</div>
              <div class="answer-text">{{ item.userAnswer || '未作答' }}</div>
            </div>
            <div class="answer-item correct-answer">
              <div class="answer-label">正确答案</div>
              <div class="answer-text" v-if="item.question.answerType === 'text'">
                {{ item.question.answerText }}
              </div>
              <div class="answer-text" v-else-if="item.question.answerType === 'choice'">
                {{ getChoiceAnswer(item.question) }}
              </div>
              <div class="answer-text" v-else>
                见图片
              </div>
            </div>
          </div>
          <div v-if="item.question.answerType === 'image' && item.question.answerImage" class="answer-image-wrap">
            <div class="answer-image-label">答案图片：</div>
            <img :src="item.question.answerImage" alt="答案图片" class="answer-image" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="!showResult && !showWrongAnswers && questions.length > 0" class="practice-container">
      <div class="practice-header">
        <div class="header-left">
          <el-button :icon="ArrowLeft" circle @click="goHome">返回</el-button>
          <div class="type-info">
            <span class="type-name">{{ currentTypeName }}</span>
          </div>
        </div>
        <div class="progress-info">
          <span class="progress-text">{{ currentIndex + 1 }} / {{ questions.length }}</span>
          <el-progress
            :percentage="progressPercent"
            :stroke-width="8"
            :show-text="false"
            class="progress-bar"
          />
        </div>
      </div>

      <div class="question-card">
        <div class="question-number">
          <span class="number-badge">第 {{ currentIndex + 1 }} 题</span>
          <span class="question-type-tag">{{ getQuestionTypeLabel(currentQuestion.answerType) }}</span>
        </div>

        <div class="question-content" v-html="currentQuestion.content"></div>

        <div v-if="currentQuestion.answerType === 'text'" class="answer-section text-answer">
          <el-input
            v-model="userAnswer"
            type="textarea"
            :rows="4"
            placeholder="请输入你的答案..."
            :disabled="answered"
            class="answer-textarea"
            resize="none"
          />
          <el-button
            v-if="!answered"
            type="primary"
            size="large"
            class="submit-btn"
            @click="submitAnswer"
          >
            提交答案
          </el-button>
        </div>

        <div v-else-if="currentQuestion.answerType === 'choice'" class="answer-section choice-answer">
          <div class="options-list">
            <div
              v-for="(option, index) in currentQuestion.options"
              :key="index"
              class="option-card"
              :class="{
                'selected': selectedOption === index,
                'correct': answered && index === currentQuestion.correctIndex,
                'wrong': answered && selectedOption === index && index !== currentQuestion.correctIndex,
                'disabled': answered
              }"
              @click="selectOption(index)"
            >
              <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
              <span class="option-text">{{ option.text }}</span>
              <span v-if="answered && index === currentQuestion.correctIndex" class="option-icon">✅</span>
              <span v-if="answered && selectedOption === index && index !== currentQuestion.correctIndex" class="option-icon">❌</span>
            </div>
          </div>
        </div>

        <div v-else-if="currentQuestion.answerType === 'image'" class="answer-section image-answer">
          <el-input
            v-model="userAnswer"
            type="textarea"
            :rows="3"
            placeholder="请描述你的答案..."
            :disabled="answered"
            class="answer-textarea"
            resize="none"
          />
          <el-button
            v-if="!answered"
            type="primary"
            size="large"
            class="submit-btn"
            @click="submitAnswer"
          >
            提交答案
          </el-button>
          <div v-if="answered && currentQuestion.answerImage" class="answer-image-wrap">
              <div class="answer-image-label">正确答案图片：</div>
              <img :src="currentQuestion.answerImage" alt="答案图片" class="answer-image" />
            </div>
        </div>

        <transition name="fade">
          <div v-if="answered" class="feedback-section" :class="{ 'correct': isCurrentCorrect, 'wrong': !isCurrentCorrect }">
            <div class="feedback-icon">{{ isCurrentCorrect ? '🎉' : '😢'}}</div>
            <div class="feedback-text">
              <strong>{{ isCurrentCorrect ? '回答正确！太棒了！' : '回答错误，继续加油！' }}</strong>
            </div>
            <div v-if="!isCurrentCorrect && currentQuestion.answerType === 'text'" class="correct-answer-show">
              正确答案：{{ currentQuestion.answerText }}
            </div>
            <div v-if="!isCurrentCorrect && currentQuestion.answerType === 'choice'" class="correct-answer-show">
              正确答案：{{ getChoiceAnswer(currentQuestion) }}
            </div>
          </div>
        </transition>
      </div>

      <div class="practice-footer">
        <el-button
          size="large"
          :disabled="currentIndex === 0"
          @click="prevQuestion"
          class="nav-btn"
        >
          <el-icon><ArrowLeft /></el-icon>
          上一题
        </el-button>
        <el-button
          size="large"
        type="primary"
          :disabled="!answered"
        @click="nextQuestion"
          class="nav-btn next-btn"
        >
          {{ currentIndex === questions.length - 1 ? '查看结果' : '下一题' }}
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>

    <div v-if="!showResult && !showWrongAnswers && questions.length === 0 && !loading" class="empty-state">
      <div class="empty-icon">📭</div>
      <h3 class="empty-title">该类型暂无题目</h3>
      <p class="empty-desc">请让家长添加题目后再来练习吧！</p>
      <el-button type="primary" size="large" @click="goHome">返回首页</el-button>
    </div>

    <div v-loading="loading" class="loading-wrap"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { useQuestionStore } from '@/stores/question'
import { useAnswerStore } from '@/stores/answer'

const route = useRoute()
const router = useRouter()
const questionStore = useQuestionStore()
const answerStore = useAnswerStore()

const loading = ref(true)
const questions = ref([])
const currentIndex = ref(0)
const userAnswer = ref('')
const selectedOption = ref(null)
const answered = ref(false)
const isCurrentCorrect = ref(false)
const answers = ref([])
const showResult = ref(false)
const showWrongAnswers = ref(false)
const wrongAnswers = ref([])

const typeId = computed(() => Number(route.query.typeId))

const currentQuestion = computed(() => {
  return questions.value[currentIndex.value] || {}
})

const currentTypeName = computed(() => {
  return questionStore.getTypeById(typeId.value)
})

const progressPercent = computed(() => {
  if (questions.value.length === 0) return 0
  return Math.round(((currentIndex.value + 1) / questions.value.length) * 100)
})

const resultData = computed(() => {
  const total = questions.value.length
  const correct = answers.value.filter(a => a.isCorrect).length
  const wrong = total - correct
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100)
  return { total, correct, wrong, accuracy }
})

const scoreEmoji = computed(() => {
  const acc = resultData.value.accuracy
  if (acc >= 90) return '🏆'
  if (acc >= 70) return '😊'
  if (acc >= 60) return '💪'
  return '📚'
})

function shuffleArray(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function getQuestionTypeLabel(type) {
  const labels = {
    text: '文本题',
    choice: '选择题',
    image: '图片题'
  }
  return labels[type] || '未知类型'
}

function getChoiceAnswer(question) {
  if (!question.options || question.correctIndex === undefined) return ''
  const letter = String.fromCharCode(65 + question.correctIndex)
  return `${letter}. ${question.options[question.correctIndex]?.text || ''}`
}

function selectOption(index) {
  if (answered.value) return
  selectedOption.value = index
  submitChoiceAnswer()
}

function submitChoiceAnswer() {
  if (selectedOption.value === null) return
  const correct = selectedOption.value === currentQuestion.value.correctIndex
  isCurrentCorrect.value = correct
  answered.value = true
  saveAnswerRecord(correct)
}

function submitAnswer() {
  if (!userAnswer.value.trim()) {
    ElMessage.warning('请输入答案')
    return
  }
  const correct = checkTextAnswer(userAnswer.value.trim(), currentQuestion.value.answerText)
  isCurrentCorrect.value = correct
  answered.value = true
  saveAnswerRecord(correct)
}

function checkTextAnswer(userAns, correctAns) {
  const normalize = (str) => str.replace(/\s/g, '').toLowerCase()
  return normalize(userAns) === normalize(correctAns)
}

function saveAnswerRecord(isCorrect) {
  let userAnswerText = ''
  if (currentQuestion.value.answerType === 'choice') {
    const opt = currentQuestion.value.options?.[selectedOption.value]
    userAnswerText = opt ? `${String.fromCharCode(65 + selectedOption.value)}. ${opt.text}` : ''
  } else {
    userAnswerText = userAnswer.value
  }

  answers.value.push({
    questionId: currentQuestion.value.id,
    question: currentQuestion.value,
    userAnswer: userAnswerText,
    isCorrect
  })

  answerStore.addRecord({
    questionId: currentQuestion.value.id,
    typeId: typeId.value,
    userAnswer: userAnswerText,
    isCorrect,
    questionContent: currentQuestion.value.content
  })
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    resetAnswerState()
    loadAnswerState()
  }
}

function nextQuestion() {
  if (!answered.value) return
  
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
    resetAnswerState()
    loadAnswerState()
  } else {
    showResult.value = true
    wrongAnswers.value = answers.value.filter(a => !a.isCorrect)
  }
}

function resetAnswerState() {
  userAnswer.value = ''
  selectedOption.value = null
  answered.value = false
  isCurrentCorrect.value = false
}

function loadAnswerState() {
  const saved = answers.value.find(a => a.questionId === currentQuestion.value.id)
  if (saved) {
    answered.value = true
    isCurrentCorrect.value = saved.isCorrect
    if (currentQuestion.value.answerType === 'choice') {
      const idx = currentQuestion.value.options?.findIndex(
        (opt, i) => `${String.fromCharCode(65 + i)}. ${opt.text}` === saved.userAnswer
      )
      selectedOption.value = idx >= 0 ? idx : null
    } else {
      userAnswer.value = saved.userAnswer
    }
  }
}

function restartPractice() {
  showResult.value = false
  showWrongAnswers.value = false
  answers.value = []
  currentIndex.value = 0
  resetAnswerState()
  questions.value = shuffleArray(questions.value)
}

function goHome() {
  router.push('/')
}

function showWrongList() {
  showWrongAnswers.value = true
}

function backToResult() {
  showWrongAnswers.value = false
}

onMounted(async () => {
  loading.value = true
  try {
    await questionStore.fetchTypes()
    const typeQuestions = await questionStore.fetchQuestionsByTypeId(typeId.value)
    questions.value = shuffleArray(typeQuestions)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.practice-page {
  min-height: calc(100vh - 100px);
}

.loading-wrap {
  min-height: 300px;
}

.practice-header {
  background: #fff;
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .type-info {
      .type-name {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .progress-info {
    flex: 1;
    max-width: 300px;
    margin-left: 24px;
    text-align: right;

    .progress-text {
      font-size: 16px;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 6px;
      display: block;
    }

    .progress-bar {
      :deep(.el-progress-bar__inner) {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      }
    }
  }
}

.question-card {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);

  .question-number {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;

    .number-badge {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }

    .question-type-tag {
      background: #f0f2f5;
      color: #666;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
    }
  }

  .question-content {
    font-size: 18px;
    line-height: 1.8;
    color: #303133;
    margin-bottom: 28px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 12px;

    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 10px 0;
    }
  }
}

.answer-section {
  margin-bottom: 20px;

  .answer-textarea {
    margin-bottom: 16px;

    :deep(.el-textarea__inner) {
      border-radius: 12px;
      font-size: 16px;
      padding: 16px;
    }
  }

  .submit-btn {
    width: 100%;
    border-radius: 25px;
    font-size: 16px;
    font-weight: 600;
    height: 48px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
  }
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: #fff;

  &:hover:not(.disabled) {
    border-color: #667eea;
    background: #f5f7ff;
  }

  &.selected:not(.correct):not(.wrong) {
    border-color: #667eea;
    background: #f0f2ff;
  }

  &.correct {
    border-color: #67c23a;
    background: #f0f9eb;
  }

  &.wrong {
    border-color: #f56c6c;
    background: #fef0f0;
  }

  &.disabled {
    cursor: default;
  }

  .option-letter {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #f0f2f5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
    flex-shrink: 0;
  }

  &.selected:not(.correct):not(.wrong) .option-letter {
    background: #667eea;
    color: #fff;
  }

  &.correct .option-letter {
    background: #67c23a;
    color: #fff;
  }

  &.wrong .option-letter {
    background: #f56c6c;
    color: #fff;
  }

  .option-text {
    flex: 1;
    font-size: 16px;
    color: #303133;
  }

  .option-icon {
    font-size: 20px;
    flex-shrink: 0;
  }
}

.answer-image-wrap {
  margin-top: 16px;

  .answer-image-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }

  .answer-image {
    max-width: 100%;
    max-height: 300px;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
  }
}

.feedback-section {
  margin-top: 24px;
  padding: 20px;
  border-radius: 12px;
  text-align: center;

  &.correct {
    background: #f0f9eb;
    border: 1px solid #67c23a;
  }

  &.wrong {
    background: #fef0f0;
    border: 1px solid #f56c6c;
  }

  .feedback-icon {
    font-size: 40px;
    margin-bottom: 8px;
  }

  .feedback-text {
    font-size: 18px;
    font-weight: 600;

    &.correct strong {
      color: #67c23a;
    }

    &.wrong strong {
      color: #f56c6c;
    }
  }

  .correct-answer-show {
    margin-top: 8px;
    font-size: 14px;
    color: #666;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.practice-footer {
  display: flex;
  justify-content: space-between;
  gap: 16px;

  .nav-btn {
    flex: 1;
    max-width: 200px;
    height: 48px;
    border-radius: 24px;
    font-size: 16px;
    font-weight: 600;

    &.next-btn {
      margin-left: auto;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      }
    }
  }
}

.result-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 100px);
}

.result-card {
  background: #fff;
  border-radius: 24px;
  padding: 48px;
  text-align: center;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;

  .result-icon {
    font-size: 80px;
    margin-bottom: 16px;
    animation: bounce 1s ease-in-out;
  }

  .result-title {
    font-size: 28px;
    font-weight: 700;
    color: #303133;
    margin-bottom: 24px;
  }

  .score-section {
    margin-bottom: 32px;

    .score-circle {
      width: 160px;
      height: 160px;
      margin: 0 auto;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #fff;
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);

      .score-number {
        font-size: 42px;
        font-weight: 700;
        line-height: 1;
      }

      .score-label {
        font-size: 14px;
        opacity: 0.9;
        margin-top: 4px;
      }
    }
  }

  .result-stats {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-bottom: 32px;

    .result-stat {
      flex: 1;
      padding: 16px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 12px;

      &.correct {
        background: #f0f9eb;
      }

      &.wrong {
        background: #fef0f0;
      }

      &.total {
        background: #ecf5ff;
      }

      .stat-icon {
        font-size: 32px;
      }

      .stat-content {
        text-align: left;

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #303133;
        }

        .stat-text {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }

  .result-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .action-btn {
      width: 100%;
      height: 48px;
      border-radius: 24px;
      font-size: 16px;
      font-weight: 600;

      .btn-icon {
        margin-right: 8px;
      }

      &.primary-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: #fff;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
      }

      &.retry-btn {
        background: #fff;
        border: 2px solid #67c23a;
        color: #67c23a;

        &:hover {
          background: #f0f9eb;
        }
      }

      &.back-btn {
        background: #fff;
        border: 2px solid #909399;
        color: #606266;

        &:hover {
          background: #f5f7fa;
        }
      }
    }
  }
}

.wrong-list-container {
  .wrong-list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border-radius: 16px;
    padding: 16px 24px;
    margin-bottom: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);

    .wrong-list-title {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }

  .wrong-questions {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .wrong-question-card {
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
    border-left: 4px solid #f56c6c;

    .wrong-question-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      .wrong-index {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }

      .wrong-tag {
        background: #fef0f0;
        color: #f56c6c;
        padding: 2px 10px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 500;
      }
    }

    .question-content {
      font-size: 16px;
      line-height: 1.6;
      color: #303133;
      margin-bottom: 16px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;

      :deep(img) {
        max-width: 100%;
        height: auto;
        border-radius: 4px;
      }
    }

    .answer-comparison {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;

      .answer-item {
        padding: 12px;
        border-radius: 8px;

        &.wrong-answer {
          background: #fef0f0;
        }

        &.correct-answer {
          background: #f0f9eb;
        }

        .answer-label {
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;
        }

        .answer-text {
          font-size: 14px;
          color: #303133;
          font-weight: 500;
        }
      }
    }

    .answer-image-wrap {
      margin-top: 12px;

      .answer-image-label {
        font-size: 12px;
        color: #666;
        margin-bottom: 6px;
      }

      .answer-image {
        max-width: 200px;
        max-height: 200px;
        border-radius: 6px;
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .empty-title {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }

  .empty-desc {
    font-size: 14px;
    color: #909399;
    margin-bottom: 24px;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@media (max-width: 768px) {
  .practice-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;

    .progress-info {
      max-width: 100%;
      margin-left: 0;
    }
  }

  .question-card {
    padding: 20px;
  }

  .result-card {
    padding: 32px 24px;
  }

  .result-stats {
    flex-direction: column;
  }

  .answer-comparison {
    grid-template-columns: 1fr;
  }
}
</style>
