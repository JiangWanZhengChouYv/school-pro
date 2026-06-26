import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { answerRecordsDB } from '@/utils/db'
import { handleDBError } from '@/utils/errorHandler'

export const useAnswerStore = defineStore('answer', () => {
  const records = ref([])
  const wrongRecords = ref([])
  const stats = ref({
    byType: {},
    byDate: {},
    total: 0,
    correct: 0,
    wrong: 0
  })

  const accuracyRate = computed(() => {
    if (stats.value.total === 0) return 0
    return Math.round((stats.value.correct / stats.value.total) * 100)
  })

  async function addRecord(data) {
    try {
      const id = await answerRecordsDB.add(data)
      await fetchRecords()
      await fetchStats()
      return id
    } catch (err) {
      handleDBError(err, '保存答题记录')
      throw err
    }
  }

  async function fetchRecords() {
    try {
      const data = await answerRecordsDB.getAll()
      records.value = data.sort((a, b) => b.createdAt - a.createdAt)
      return records.value
    } catch (err) {
      handleDBError(err, '加载答题记录')
      records.value = []
      throw err
    }
  }

  async function fetchWrongRecords() {
    try {
      const data = await answerRecordsDB.getByCorrect(false)
      const sorted = data.sort((a, b) => b.createdAt - a.createdAt)
      
      const uniqueMap = new Map()
      for (const record of sorted) {
        if (!uniqueMap.has(record.questionId)) {
          uniqueMap.set(record.questionId, record)
        }
      }
      
      wrongRecords.value = Array.from(uniqueMap.values())
      return wrongRecords.value
    } catch (err) {
      handleDBError(err, '加载错题记录')
      wrongRecords.value = []
      throw err
    }
  }

  async function fetchStats() {
    try {
      const allRecords = await answerRecordsDB.getAll()
      const total = allRecords.length
      const correct = allRecords.filter(r => r.isCorrect).length
      const wrong = total - correct

      const byType = {}
      const byDate = {}

      allRecords.forEach(record => {
        if (!byType[record.typeId]) {
          byType[record.typeId] = { total: 0, correct: 0, wrong: 0, accuracy: 0 }
        }
        byType[record.typeId].total++
        if (record.isCorrect) {
          byType[record.typeId].correct++
        } else {
          byType[record.typeId].wrong++
        }

        const date = new Date(record.createdAt).toLocaleDateString()
        if (!byDate[date]) {
          byDate[date] = { total: 0, correct: 0, wrong: 0, accuracy: 0 }
        }
        byDate[date].total++
        if (record.isCorrect) {
          byDate[date].correct++
        } else {
          byDate[date].wrong++
        }
      })

      Object.keys(byType).forEach(key => {
        const item = byType[key]
        item.accuracy = item.total === 0 ? 0 : Math.round((item.correct / item.total) * 100)
      })

      Object.keys(byDate).forEach(key => {
        const item = byDate[key]
        item.accuracy = item.total === 0 ? 0 : Math.round((item.correct / item.total) * 100)
      })

      stats.value = {
        byType,
        byDate,
        total,
        correct,
        wrong,
        accuracyRate: total === 0 ? 0 : Math.round((correct / total) * 100)
      }

      return stats.value
    } catch (err) {
      handleDBError(err, '加载统计数据')
      stats.value = {
        byType: {},
        byDate: {},
        total: 0,
        correct: 0,
        wrong: 0,
        accuracyRate: 0
      }
      throw err
    }
  }

  function getStatsByType() {
    return stats.value.byType
  }

  function getStatsByDate(days = 7) {
    const result = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString()
      const dayStats = stats.value.byDate[dateStr] || { total: 0, correct: 0, wrong: 0, accuracy: 0 }
      result.push({
        date: dateStr,
        dayLabel: `${date.getMonth() + 1}/${date.getDate()}`,
        ...dayStats
      })
    }

    return result
  }

  async function clearRecords() {
    try {
      await answerRecordsDB.clear()
      records.value = []
      wrongRecords.value = []
      stats.value = {
        byType: {},
        byDate: {},
        total: 0,
        correct: 0,
        wrong: 0,
        accuracyRate: 0
      }
    } catch (err) {
      handleDBError(err, '清除答题记录')
      throw err
    }
  }

  return {
    records,
    wrongRecords,
    stats,
    accuracyRate,
    addRecord,
    fetchRecords,
    fetchWrongRecords,
    fetchStats,
    getStatsByType,
    getStatsByDate,
    clearRecords
  }
})
