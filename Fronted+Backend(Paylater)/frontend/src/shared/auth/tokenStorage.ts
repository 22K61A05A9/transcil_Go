const TOKEN_STORAGE_KEY = 'paylater.auth.token'

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage
}

/**
 * Single place for JWT persistence.
 * Never store passwords, INTERNAL_SERVICE_TOKEN, or other secrets here.
 */
export function getToken(): string | null {
  const storage = getStorage()
  if (!storage) {
    return null
  }

  const value = storage.getItem(TOKEN_STORAGE_KEY)
  if (value === null || value.trim() === '') {
    return null
  }

  return value
}

export function setToken(token: string): void {
  const storage = getStorage()
  if (!storage) {
    return
  }

  const trimmed = token.trim()
  if (trimmed === '') {
    throw new Error('Cannot store an empty auth token')
  }

  storage.setItem(TOKEN_STORAGE_KEY, trimmed)
}

export function removeToken(): void {
  const storage = getStorage()
  if (!storage) {
    return
  }

  storage.removeItem(TOKEN_STORAGE_KEY)
}

/**
 * Clears client-side auth persistence.
 * There is no backend logout endpoint — this is local only.
 */
export function clearSession(): void {
  removeToken()
}

export const authTokenStorageKey = TOKEN_STORAGE_KEY
