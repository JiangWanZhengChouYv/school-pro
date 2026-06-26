import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAiConfigStore } from '@/stores/aiConfig'
import { useQuestionStore } from '@/stores/question'
import { questionTypesDB, questionsDB } from '@/utils/db'
import { questionGenerationSystemPrompt, generateQuestionsSchema } from '@/utils/prompts'

export const useAiStore = defineStore('ai', () => {
  const generating = ref(false)
  const generatedQuestions = ref([])

  const aiConfigStore = useAiConfigStore()
  const questionStore = useQuestionStore()

  function parseAnswer(answerRaw, answerType) {
    if (answerType === 'text') {
      if (typeof answerRaw === 'string') {
        return answerRaw
      }
      return JSON.stringify(answerRaw)
    }
    if (answerType === 'choice') {
      if (typeof answerRaw === 'string') {
        try {
          const parsed = JSON.parse(answerRaw)
          return {
            options: parsed.options || [],
            correctIndex: parsed.correctIndex ?? 0
          }
        } catch {
          return {
            options: [answerRaw],
            correctIndex: 0
          }
        }
      }
      return {
        options: answerRaw.options || [],
        correctIndex: answerRaw.correctIndex ?? 0
      }
    }
    if (answerType === 'image') {
      return typeof answerRaw === 'string' ? answerRaw : JSON.stringify(answerRaw)
    }
    return answerRaw
  }

  function normalizeQuestions(aiQuestions) {
    return aiQuestions.map((q, index) => {
      const answerType = q.answerType || 'text'
      const parsedAnswer = parseAnswer(q.answer, answerType)
      
      const normalized = {
        _tempId: `temp_${Date.now()}_${index}`,
        content: q.content || '',
        answerType: answerType,
        typeName: q.typeName || '未分类'
      }

      if (answerType === 'text') {
        normalized.answerText = parsedAnswer
      } else if (answerType === 'choice') {
        normalized.options = parsedAnswer.options || []
        normalized.correctIndex = parsedAnswer.correctIndex ?? 0
      } else if (answerType === 'image') {
        normalized.answerImage = parsedAnswer
      }

      return normalized
    })
  }

  async function generateQuestions(prompt, count = 10) {
    if (!aiConfigStore.hasValidConfig()) {
      throw new Error('AI配置不完整，请先配置API密钥和模型')
    }

    generating.value = true
    generatedQuestions.value = []

    try {
      if (questionStore.types.length === 0) {
        await questionStore.fetchTypes()
      }

      const client = aiConfigStore.getClient()
      const systemPrompt = questionGenerationSystemPrompt(questionStore.types)
      const userPrompt = `请生成 ${count} 道以下要求的题目：\n${prompt}`

      const result = await client.chatCompletions({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [generateQuestionsSchema],
        temperature: 0.7,
        maxTokens: 2000
      })

      let questionsData = []

      if (result.toolCalls && result.toolCalls.length > 0) {
        for (const tc of result.toolCalls) {
          if (tc.function?.name === 'generateQuestions') {
            try {
              const args = JSON.parse(tc.function.arguments || '{}')
              if (args.questions && Array.isArray(args.questions)) {
                questionsData = questionsData.concat(args.questions)
              }
            } catch (e) {
              console.error('Failed to parse tool call arguments:', e)
            }
          }
        }
      }

      if (questionsData.length === 0 && result.content) {
        console.warn('No tool calls found, trying to parse content as JSON')
        try {
          const jsonMatch = result.content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            if (parsed.questions && Array.isArray(parsed.questions)) {
              questionsData = parsed.questions
            }
          }
        } catch (e) {
          console.error('Failed to parse content as JSON:', e)
        }
      }

      if (questionsData.length === 0) {
        throw new Error('AI未能返回有效的题目数据，请重试')
      }

      generatedQuestions.value = normalizeQuestions(questionsData)
      return generatedQuestions.value
    } finally {
      generating.value = false
    }
  }

  async function getOrCreateType(typeName) {
    const existing = await questionTypesDB.getByName(typeName)
    if (existing) {
      return existing.id
    }
    return await questionTypesDB.add({ name: typeName })
  }

  async function saveSingleQuestion(questionData) {
    const typeId = await getOrCreateType(questionData.typeName)
    
    const data = {
      typeId,
      content: questionData.content,
      answerType: questionData.answerType
    }

    if (questionData.answerType === 'text') {
      data.answerText = questionData.answerText
    } else if (questionData.answerType === 'choice') {
      data.options = questionData.options
      data.correctIndex = questionData.correctIndex
    } else if (questionData.answerType === 'image') {
      data.answerImage = questionData.answerImage
    }

    const id = await questionsDB.add(data)
    await questionStore.fetchTypes()
    await questionStore.fetchQuestions()
    
    return id
  }

  async function saveAllQuestions() {
    if (generatedQuestions.value.length === 0) {
      return 0
    }

    let savedCount = 0
    for (const q of generatedQuestions.value) {
      try {
        await saveSingleQuestion(q)
        savedCount++
      } catch (e) {
        console.error('Failed to save question:', e)
      }
    }

    return savedCount
  }

  function updateGeneratedQuestion(tempId, data) {
    const index = generatedQuestions.value.findIndex(q => q._tempId === tempId)
    if (index !== -1) {
      generatedQuestions.value[index] = {
        ...generatedQuestions.value[index],
        ...data
      }
    }
  }

  function removeGeneratedQuestion(tempId) {
    generatedQuestions.value = generatedQuestions.value.filter(q => q._tempId !== tempId)
  }

  function clearGeneratedQuestions() {
    generatedQuestions.value = []
  }

  return {
    generating,
    generatedQuestions,
    generateQuestions,
    saveSingleQuestion,
    saveAllQuestions,
    updateGeneratedQuestion,
    removeGeneratedQuestion,
    clearGeneratedQuestions
  }
})
