import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { questionTypesDB, questionsDB } from '@/utils/db'
import { handleDBError } from '@/utils/errorHandler'

export const useQuestionStore = defineStore('question', () => {
  const types = ref([])
  const questions = ref([])
  const loading = ref(false)
  const searchKeyword = ref('')
  const filterTypeId = ref(null)
  const currentPage = ref(1)
  const pageSize = ref(10)

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

  const filteredQuestions = computed(() => {
    let result = [...questions.value]

    if (filterTypeId.value !== null && filterTypeId.value !== undefined && filterTypeId.value !== '') {
      result = result.filter(q => q.typeId === filterTypeId.value)
    }

    if (searchKeyword.value && searchKeyword.value.trim()) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter(q => {
        const content = q.content || ''
        const textContent = content.replace(/<[^>]*>/g, '').toLowerCase()
        return textContent.includes(keyword)
      })
    }

    result.sort((a, b) => b.createdAt - a.createdAt)

    return result
  })

  const totalFiltered = computed(() => filteredQuestions.value.length)

  const totalPages = computed(() => {
    return Math.ceil(totalFiltered.value / pageSize.value) || 1
  })

  const paginatedQuestions = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredQuestions.value.slice(start, end)
  })

  function stripHtml(html) {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  async function fetchTypes() {
    loading.value = true
    try {
      const data = await questionTypesDB.getAll()
      types.value = data
      return data
    } catch (err) {
      handleDBError(err, '加载题目类型')
      types.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  async function addType(name) {
    try {
      const existing = await questionTypesDB.getByName(name)
      if (existing) {
        throw new Error('类型名称已存在')
      }
      const id = await questionTypesDB.add({ name })
      await fetchTypes()
      return id
    } catch (err) {
      if (err.message !== '类型名称已存在') {
        handleDBError(err, '添加题目类型')
      }
      throw err
    }
  }

  async function removeType(id) {
    try {
      const typeQuestions = await questionsDB.getByTypeId(id)
      for (const q of typeQuestions) {
        await questionsDB.remove(q.id)
      }
      await questionTypesDB.remove(id)
      await fetchTypes()
      await fetchQuestions()
    } catch (err) {
      handleDBError(err, '删除题目类型')
      throw err
    }
  }

  async function fetchQuestions() {
    loading.value = true
    try {
      const data = await questionsDB.getAll()
      questions.value = data
      return data
    } catch (err) {
      handleDBError(err, '加载题目列表')
      questions.value = []
      throw err
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
    } catch (err) {
      handleDBError(err, '加载题目列表')
      questions.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  async function addQuestion(data) {
    try {
      const id = await questionsDB.add(data)
      await fetchQuestions()
      return id
    } catch (err) {
      handleDBError(err, '添加题目')
      throw err
    }
  }

  async function updateQuestion(id, data) {
    try {
      await questionsDB.update(id, data)
      await fetchQuestions()
    } catch (err) {
      handleDBError(err, '更新题目')
      throw err
    }
  }

  async function removeQuestion(id) {
    try {
      await questionsDB.remove(id)
      await fetchQuestions()
    } catch (err) {
      handleDBError(err, '删除题目')
      throw err
    }
  }

  function getTypeById(id) {
    const type = types.value.find(t => t.id === id)
    return type ? type.name : ''
  }

  function getQuestionCountByTypeId(typeId) {
    return typeQuestionCount.value[typeId] || 0
  }

  function setSearchKeyword(keyword) {
    searchKeyword.value = keyword
    currentPage.value = 1
  }

  function setFilterTypeId(typeId) {
    filterTypeId.value = typeId
    currentPage.value = 1
  }

  function setCurrentPage(page) {
    currentPage.value = page
  }

  function setPageSize(size) {
    pageSize.value = size
    currentPage.value = 1
  }

  function resetFilters() {
    searchKeyword.value = ''
    filterTypeId.value = null
    currentPage.value = 1
  }

  function getQuestionById(id) {
    return questions.value.find(q => q.id === id)
  }

  return {
    types,
    questions,
    loading,
    searchKeyword,
    filterTypeId,
    currentPage,
    pageSize,
    typeQuestionCount,
    typesWithCount,
    totalQuestions,
    totalTypes,
    filteredQuestions,
    totalFiltered,
    totalPages,
    paginatedQuestions,
    fetchTypes,
    addType,
    removeType,
    fetchQuestions,
    fetchQuestionsByTypeId,
    addQuestion,
    updateQuestion,
    removeQuestion,
    getTypeById,
    getQuestionCountByTypeId,
    setSearchKeyword,
    setFilterTypeId,
    setCurrentPage,
    setPageSize,
    resetFilters,
    getQuestionById,
    stripHtml
  }
})
