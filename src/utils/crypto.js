import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

const SECRET_KEY = 'school-learning-app-2024'

export function hashPassword(password) {
  return bcrypt.hashSync(password, SALT_ROUNDS)
}

export function verifyPassword(password, hash) {
  try {
    return bcrypt.compareSync(password, hash)
  } catch (e) {
    console.error('Password verification failed:', e)
    return false
  }
}

function stringToBytes(str) {
  return new TextEncoder().encode(str)
}

function bytesToString(bytes) {
  return new TextDecoder().decode(bytes)
}

function xorBytes(dataBytes, keyBytes) {
  const result = new Uint8Array(dataBytes.length)
  for (let i = 0; i < dataBytes.length; i++) {
    result[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length]
  }
  return result
}

export function simpleEncrypt(text) {
  try {
    const textBytes = stringToBytes(text)
    const keyBytes = stringToBytes(SECRET_KEY)
    const encrypted = xorBytes(textBytes, keyBytes)
    const binary = String.fromCharCode(...encrypted)
    return btoa(binary)
  } catch (e) {
    console.error('Encryption failed:', e)
    return null
  }
}

export function simpleDecrypt(encryptedText) {
  try {
    const binary = atob(encryptedText)
    const encryptedBytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      encryptedBytes[i] = binary.charCodeAt(i)
    }
    const keyBytes = stringToBytes(SECRET_KEY)
    const decrypted = xorBytes(encryptedBytes, keyBytes)
    return bytesToString(decrypted)
  } catch (e) {
    console.error('Decryption failed:', e)
    return null
  }
}

export default {
  hashPassword,
  verifyPassword,
  simpleEncrypt,
  simpleDecrypt
}
