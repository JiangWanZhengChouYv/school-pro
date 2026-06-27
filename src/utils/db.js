import { openDB } from 'idb'

const DB_NAME = 'schoolLearningDB'
const DB_VERSION = 1

const STORES = {
  QUESTIONS: 'questions',
  QUESTION_TYPES: 'questionTypes',
  ANSWER_RECORDS: 'answerRecords'
}

let dbPromise = null

function initDB() {
  if (dbPromise) return dbPromise

  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORES.QUESTIONS)) {
        const questionsStore = db.createObjectStore(STORES.QUESTIONS, {
          keyPath: 'id',
          autoIncrement: true
        })
        questionsStore.createIndex('typeId', 'typeId', { unique: false })
        questionsStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.QUESTION_TYPES)) {
        const questionTypesStore = db.createObjectStore(STORES.QUESTION_TYPES, {
          keyPath: 'id',
          autoIncrement: true
        })
        questionTypesStore.createIndex('name', 'name', { unique: true })
      }

      if (!db.objectStoreNames.contains(STORES.ANSWER_RECORDS)) {
        const answerRecordsStore = db.createObjectStore(STORES.ANSWER_RECORDS, {
          keyPath: 'id',
          autoIncrement: true
        })
        answerRecordsStore.createIndex('questionId', 'questionId', { unique: false })
        answerRecordsStore.createIndex('typeId', 'typeId', { unique: false })
        answerRecordsStore.createIndex('isCorrect', 'isCorrect', { unique: false })
        answerRecordsStore.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
  })

  return dbPromise
}

function getTimestamp() {
  return Date.now()
}

export const questionTypesDB = {
  async add(data) {
    const db = await initDB()
    const now = getTimestamp()
    const item = { ...data, createdAt: now }
    return db.add(STORES.QUESTION_TYPES, item)
  },

  async get(id) {
    const db = await initDB()
    return db.get(STORES.QUESTION_TYPES, id)
  },

  async getByName(name) {
    const db = await initDB()
    const index = db.transaction(STORES.QUESTION_TYPES).store.index('name')
    return index.get(name)
  },

  async getAll() {
    const db = await initDB()
    return db.getAll(STORES.QUESTION_TYPES)
  },

  async update(id, data) {
    const db = await initDB()
    const existing = await db.get(STORES.QUESTION_TYPES, id)
    if (!existing) throw new Error(`QuestionType with id ${id} not found`)
    const updated = { ...existing, ...data }
    return db.put(STORES.QUESTION_TYPES, updated)
  },

  async remove(id) {
    const db = await initDB()
    return db.delete(STORES.QUESTION_TYPES, id)
  },

  async clear() {
    const db = await initDB()
    return db.clear(STORES.QUESTION_TYPES)
  },

  async count() {
    const db = await initDB()
    return db.count(STORES.QUESTION_TYPES)
  }
}

export const questionsDB = {
  async add(data) {
    const db = await initDB()
    const now = getTimestamp()
    const item = { ...data, createdAt: now, updatedAt: now }
    return db.add(STORES.QUESTIONS, item)
  },

  async get(id) {
    const db = await initDB()
    return db.get(STORES.QUESTIONS, id)
  },

  async getAll() {
    const db = await initDB()
    return db.getAll(STORES.QUESTIONS)
  },

  async getByTypeId(typeId) {
    if (typeId === null || typeId === undefined || typeId === '' || isNaN(typeId)) {
      return []
    }
    const db = await initDB()
    const index = db.transaction(STORES.QUESTIONS).store.index('typeId')
    return index.getAll(Number(typeId))
  },

  async update(id, data) {
    const db = await initDB()
    const existing = await db.get(STORES.QUESTIONS, id)
    if (!existing) throw new Error(`Question with id ${id} not found`)
    const now = getTimestamp()
    const updated = { ...existing, ...data, updatedAt: now }
    return db.put(STORES.QUESTIONS, updated)
  },

  async remove(id) {
    const db = await initDB()
    return db.delete(STORES.QUESTIONS, id)
  },

  async clear() {
    const db = await initDB()
    return db.clear(STORES.QUESTIONS)
  },

  async count() {
    const db = await initDB()
    return db.count(STORES.QUESTIONS)
  }
}

export const answerRecordsDB = {
  async add(data) {
    const db = await initDB()
    const now = getTimestamp()
    const item = { ...data, createdAt: now }
    return db.add(STORES.ANSWER_RECORDS, item)
  },

  async get(id) {
    const db = await initDB()
    return db.get(STORES.ANSWER_RECORDS, id)
  },

  async getAll() {
    const db = await initDB()
    return db.getAll(STORES.ANSWER_RECORDS)
  },

  async getByQuestionId(questionId) {
    if (questionId === null || questionId === undefined || questionId === '' || isNaN(questionId)) {
      return []
    }
    const db = await initDB()
    const index = db.transaction(STORES.ANSWER_RECORDS).store.index('questionId')
    return index.getAll(Number(questionId))
  },

  async getByTypeId(typeId) {
    if (typeId === null || typeId === undefined || typeId === '' || isNaN(typeId)) {
      return []
    }
    const db = await initDB()
    const index = db.transaction(STORES.ANSWER_RECORDS).store.index('typeId')
    return index.getAll(Number(typeId))
  },

  async getByCorrect(isCorrect) {
    if (isCorrect === null || isCorrect === undefined || isCorrect === '') {
      return []
    }
    const db = await initDB()
    const index = db.transaction(STORES.ANSWER_RECORDS).store.index('isCorrect')
    return index.getAll(isCorrect)
  },

  async update(id, data) {
    const db = await initDB()
    const existing = await db.get(STORES.ANSWER_RECORDS, id)
    if (!existing) throw new Error(`AnswerRecord with id ${id} not found`)
    const updated = { ...existing, ...data }
    return db.put(STORES.ANSWER_RECORDS, updated)
  },

  async remove(id) {
    const db = await initDB()
    return db.delete(STORES.ANSWER_RECORDS, id)
  },

  async clear() {
    const db = await initDB()
    return db.clear(STORES.ANSWER_RECORDS)
  },

  async count() {
    const db = await initDB()
    return db.count(STORES.ANSWER_RECORDS)
  }
}

export default {
  questionTypesDB,
  questionsDB,
  answerRecordsDB
}
