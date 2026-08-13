import { jwtDecode } from 'jwt-decode'

import { isAuthRole } from '@/shared/auth/roles'
import type { JwtClaims } from '@/shared/auth/types'

type RawJwtClaims = {
  id?: unknown
  role?: unknown
  exp?: unknown
}

/**
 * Decode a JWT payload without verifying the signature.
 * Backend HS256 verification remains the source of truth.
 */
export function decodeJwtClaims(token: string): JwtClaims {
  let raw: RawJwtClaims

  try {
    raw = jwtDecode<RawJwtClaims>(token)
  } catch {
    throw new Error('Invalid token')
  }

  if (typeof raw.id !== 'number' || !Number.isFinite(raw.id)) {
    throw new Error('Invalid token claims: id')
  }

  if (typeof raw.role !== 'string' || !isAuthRole(raw.role)) {
    throw new Error('Invalid token claims: role')
  }

  if (typeof raw.exp !== 'number' || !Number.isFinite(raw.exp)) {
    throw new Error('Invalid token claims: exp')
  }

  return {
    id: raw.id,
    role: raw.role,
    exp: raw.exp,
  }
}

/**
 * Client-side expiry hint only. The backend still validates every request.
 */
export function isJwtExpired(
  claims: Pick<JwtClaims, 'exp'>,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): boolean {
  return claims.exp <= nowSeconds
}
