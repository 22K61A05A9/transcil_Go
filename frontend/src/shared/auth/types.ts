/**
 * Backend JWT role claim values — casing must match the Go services exactly.
 */
export const AUTH_ROLES = ['user', 'merchant', 'ADMIN', 'SUPER_ADMIN'] as const

export type AuthRole = (typeof AUTH_ROLES)[number]

/**
 * Decoded JWT payload claims used by the frontend.
 * Decoding is not signature verification — the backend remains authoritative.
 */
export type JwtClaims = {
  id: number
  role: AuthRole
  /** Unix expiry time in seconds (JWT standard `exp`). */
  exp: number
}

/**
 * Client-side session derived from a stored JWT.
 */
export type AuthSession = {
  token: string
  /** Entity id from the JWT `id` claim (user, merchant, or admin id). */
  id: number
  role: AuthRole
  /** Unix expiry time in seconds from the JWT `exp` claim. */
  expiresAt: number
}
