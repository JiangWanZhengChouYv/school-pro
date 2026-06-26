export const request = (options) => {
  return new Promise((resolve, reject) => {
    console.log('Request placeholder:', options)
    resolve({ data: null, code: 200, message: 'success' })
  })
}

export default request
