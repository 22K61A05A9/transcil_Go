import { decodeJwtClaims, isJwtExpired } from '@/shared/auth/jwt'
import { clearSession, getToken, setToken } from '@/shared/auth/tokenStorage'
import type { AuthSession } from '@/shared/auth/types'

/**
 * Build a session object from a JWT string (decode only — no signature check).
 */
export function createSessionFromToken(token: string): AuthSession {
  const claims = decodeJwtClaims(token)

  return {
    token,
    id: claims.id,
    role: claims.role,
    expiresAt: claims.exp,
  }
}

/**
 * Persist a token and return the derived session.
 */
export function persistSessionFromToken(token: string): AuthSession {
  const session = createSessionFromToken(token)
  setToken(session.token)
  return session
}

/**
 * Read the stored token and derive a session.
 * Returns null when missing, invalid, or locally expired (then clears storage).
 */
export function getStoredSession(
  nowSeconds: number = Math.floor(Date.now() / 1000),
): AuthSession | null {
  const token = getToken()
  if (!token) {
    return null
  }

  try {
    const session = createSessionFromToken(token)
    if (isJwtExpired({ exp: session.expiresAt }, nowSeconds)) {
      clearSession()
      return null
    }
    return session
  } catch {
    clearSession()
    return null
  }
}
