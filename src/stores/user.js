import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false)
  const userType = ref('')

  function login(type) {
    isLoggedIn.value = true
    userType.value = type
  }

  function logout() {
    isLoggedIn.value = false
    userType.value = ''
  }

  return {
    isLoggedIn,
    userType,
    login,
    logout
  }
})
