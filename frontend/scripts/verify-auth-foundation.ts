/**
 * One-off foundation checks (not a test framework).
 * Run: npm run verify:auth
 *
 * Intentionally avoids importing the live HTTP client (needs Vite `import.meta.env`).
 * URL joining is verified via the pure `joinApiUrl` helper.
 */
import { joinApiUrl } from '../src/shared/api/url'
import { ApiError, messageFromErrorBody } from '../src/shared/api/errors'
import { decodeJwtClaims, isJwtExpired } from '../src/shared/auth/jwt'
import {
  isAdmin,
  isAuthRole,
  isMerchant,
  isSuperAdmin,
  isUser,
} from '../src/shared/auth/roles'
import { createSessionFromToken, getStoredSession } from '../src/shared/auth/session'
import {
  clearSession,
  getToken,
  removeToken,
  setToken,
} from '../src/shared/auth/tokenStorage'
import type { AuthRole } from '../src/shared/auth/types'

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message)
  }
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function makeUnsignedJwt(payload: Record<string, unknown>): string {
  const header = encodeBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const body = encodeBase64Url(JSON.stringify(payload))
  return `${header}.${body}.signature`
}

function installLocalStorageMock(): void {
  const store = new Map<string, string>()

  const localStorageMock: Storage = {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key: string) {
      return store.has(key) ? (store.get(key) ?? null) : null
    },
    key() {
      return null
    },
    removeItem(key: string) {
      store.delete(key)
    },
    setItem(key: string, value: string) {
      store.set(key, value)
    },
  }

  Object.defineProperty(globalThis, 'window', {
    value: globalThis,
    configurable: true,
  })
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    configurable: true,
  })
}

function main(): void {
  installLocalStorageMock()

  // Avoid evaluating env-backed resolveApiUrl in Node; verify the pure joiner.
  assert(
    joinApiUrl('/api', '/user/login') === '/api/user/login',
    'joinApiUrl /api + /user/login',
  )
  assert(
    joinApiUrl('/api/', 'admin/login') === '/api/admin/login',
    'joinApiUrl normalizes slashes',
  )
  console.log('OK joinApiUrl → /api/user/login')

  assert(
    messageFromErrorBody({ error: 'credit limit exceeded' }, 'fallback') ===
      'credit limit exceeded',
    'error body message',
  )
  assert(messageFromErrorBody({}, 'fallback') === 'fallback', 'error fallback')
  const err = new ApiError('Unauthorized', 401)
  assert(err.status === 401 && err.message === 'Unauthorized', 'ApiError shape')
  console.log('OK ApiError / messageFromErrorBody')

  const roles: AuthRole[] = ['user', 'merchant', 'ADMIN', 'SUPER_ADMIN']
  for (const role of roles) {
    assert(isAuthRole(role), `isAuthRole(${role})`)
  }
  assert(isUser('user') && !isUser('ADMIN'), 'isUser')
  assert(isMerchant('merchant') && !isMerchant('user'), 'isMerchant')
  assert(isAdmin('ADMIN') && isAdmin('SUPER_ADMIN') && !isAdmin('user'), 'isAdmin')
  assert(isSuperAdmin('SUPER_ADMIN') && !isSuperAdmin('ADMIN'), 'isSuperAdmin')
  console.log('OK role helpers')

  const token = makeUnsignedJwt({
    id: 42,
    role: 'user',
    exp: Math.floor(Date.now() / 1000) + 3600,
  })
  const claims = decodeJwtClaims(token)
  assert(claims.id === 42, 'jwt id')
  assert(claims.role === 'user', 'jwt role')
  assert(!isJwtExpired(claims), 'jwt not expired')
  console.log('OK JWT decode', claims)

  const expired = makeUnsignedJwt({
    id: 1,
    role: 'ADMIN',
    exp: Math.floor(Date.now() / 1000) - 10,
  })
  assert(isJwtExpired(decodeJwtClaims(expired)), 'jwt expired')

  clearSession()
  assert(getToken() === null, 'empty token')
  setToken(token)
  assert(getToken() === token, 'getToken after set')
  const session = createSessionFromToken(token)
  assert(session.id === 42 && session.role === 'user', 'session from token')
  assert(getStoredSession()?.id === 42, 'getStoredSession')
  removeToken()
  assert(getToken() === null, 'removeToken')
  setToken(expired)
  assert(getStoredSession() === null, 'expired session cleared')
  assert(getToken() === null, 'expired token removed')
  console.log('OK token storage + session')

  console.log('\nAll auth foundation checks passed.')
}

main()
