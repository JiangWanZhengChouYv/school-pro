const storage = {
  get(key) {
    try {
      const value = localStorage.getItem(key)
      if (value === null) return null
      return JSON.parse(value)
    } catch (e) {
      console.error(`Failed to get item from localStorage: ${key}`, e)
      return null
    }
  },

  set(key, value) {
    try {
      const serialized = JSON.stringify(value)
      localStorage.setItem(key, serialized)
      return true
    } catch (e) {
      console.error(`Failed to set item in localStorage: ${key}`, e)
      return false
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (e) {
      console.error(`Failed to remove item from localStorage: ${key}`, e)
      return false
    }
  },

  clear() {
    try {
      localStorage.clear()
      return true
    } catch (e) {
      console.error('Failed to clear localStorage', e)
      return false
    }
  }
}

export default storage
