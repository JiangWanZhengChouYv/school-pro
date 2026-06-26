import { defineStore } from 'pinia'
import { ref } from 'vue'
import { hashPassword, verifyPassword } from '@/utils/crypto'
import storage from '@/utils/storage'

const PASSWORD_HASH_KEY = 'parent_password_hash'
const LOGIN_STATUS_KEY = 'parent_is_logged_in'

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false)

  function init() {
    const saved = storage.get(LOGIN_STATUS_KEY)
    if (saved) {
      isLoggedIn.value = true
    }
  }

  function hasPassword() {
    const hash = storage.get(PASSWORD_HASH_KEY)
    return !!hash
  }

  function setPassword(password) {
    const hash = hashPassword(password)
    storage.set(PASSWORD_HASH_KEY, hash)
    return true
  }

  function login(password) {
    const hash = storage.get(PASSWORD_HASH_KEY)
    if (!hash) {
      return false
    }
    const valid = verifyPassword(password, hash)
    if (valid) {
      isLoggedIn.value = true
      storage.set(LOGIN_STATUS_KEY, true)
    }
    return valid
  }

  function logout() {
    isLoggedIn.value = false
    storage.remove(LOGIN_STATUS_KEY)
  }

  function checkAuth() {
    return isLoggedIn.value
  }

  init()

  return {
    isLoggedIn,
    hasPassword,
    setPassword,
    login,
    logout,
    checkAuth
  }
})
