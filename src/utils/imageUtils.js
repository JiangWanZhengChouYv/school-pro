export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'))
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      resolve(e.target.result)
    }

    reader.onerror = (e) => {
      reject(new Error('File reading failed'))
    }

    reader.readAsDataURL(file)
  })
}

export function compressImage(base64, maxWidth = 800, maxQuality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!base64) {
      reject(new Error('No base64 image provided'))
      return
    }

    const img = new Image()

    img.onload = () => {
      let { width, height } = img

      if (width > maxWidth) {
        height = (maxWidth / width) * height
        width = maxWidth
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      const compressed = canvas.toDataURL('image/jpeg', maxQuality)
      resolve(compressed)
    }

    img.onerror = () => {
      reject(new Error('Image loading failed'))
    }

    img.src = base64
  })
}

export default {
  fileToBase64,
  compressImage
}
