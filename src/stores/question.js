import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { questionTypesDB, questionsDB } from '@/utils/db'

export const useQuestionStore = defineStore('question', () => {
  const types = ref([])
  const questions = ref([])
  const loading = ref(false)

  const typeQuestionCount = computed(() => {
    const countMap = {}
    questions.value.forEach(q => {
      if (!countMap[q.typeId]) {
        countMap[q.typeId] = 0
      }
      countMap[q.typeId]++
    })
    return countMap
  })

  const typesWithCount = computed(() => {
    return types.value.map(type => ({
      ...type,
      questionCount: typeQuestionCount.value[type.id] || 0
    }))
  })

  const totalQuestions = computed(() => questions.value.length)
  const totalTypes = computed(() => types.value.length)

  async function fetchTypes() {
    loading.value = true
    try {
      const data = await questionTypesDB.getAll()
      types.value = data
      return data
    } finally {
      loading.value = false
    }
  }

  async function addType(name) {
    const existing = await questionTypesDB.getByName(name)
    if (existing) {
      throw new Error('类型名称已存在')
    }
    const id = await questionTypesDB.add({ name })
    await fetchTypes()
    return id
  }

  async function removeType(id) {
    const typeQuestions = await questionsDB.getByTypeId(id)
    for (const q of typeQuestions) {
      await questionsDB.remove(q.id)
    }
    await questionTypesDB.remove(id)
    await fetchTypes()
    await fetchQuestions()
  }

  async function fetchQuestions() {
    loading.value = true
    try {
      const data = await questionsDB.getAll()
      questions.value = data
      return data
    } finally {
      loading.value = false
    }
  }

  async function fetchQuestionsByTypeId(typeId) {
    loading.value = true
    try {
      const data = await questionsDB.getByTypeId(typeId)
      questions.value = data
      return data
    } finally {
      loading.value = false
    }
  }

  async function addQuestion(data) {
    const id = await questionsDB.add(data)
    await fetchQuestions()
    return id
  }

  async function updateQuestion(id, data) {
    await questionsDB.update(id, data)
    await fetchQuestions()
  }

  async function removeQuestion(id) {
    await questionsDB.remove(id)
    await fetchQuestions()
  }

  function getTypeById(id) {
    const type = types.value.find(t => t.id === id)
    return type ? type.name : ''
  }

  function getQuestionCountByTypeId(typeId) {
    return typeQuestionCount.value[typeId] || 0
  }

  return {
    types,
    questions,
    loading,
    typeQuestionCount,
    typesWithCount,
    totalQuestions,
    totalTypes,
    fetchTypes,
    addType,
    removeType,
    fetchQuestions,
    fetchQuestionsByTypeId,
    addQuestion,
    updateQuestion,
    removeQuestion,
    getTypeById,
    getQuestionCountByTypeId
  }
})
