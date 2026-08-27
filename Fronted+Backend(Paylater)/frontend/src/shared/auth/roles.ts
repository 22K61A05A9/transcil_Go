import type { AuthRole } from '@/shared/auth/types'
import { AUTH_ROLES } from '@/shared/auth/types'

export function isAuthRole(value: string): value is AuthRole {
  return (AUTH_ROLES as readonly string[]).includes(value)
}

export function isUser(role: AuthRole): boolean {
  return role === 'user'
}

export function isMerchant(role: AuthRole): boolean {
  return role === 'merchant'
}

/**
 * Matches backend AdminMiddleware: both ADMIN and SUPER_ADMIN.
 */
export function isAdmin(role: AuthRole): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN'
}

export function isSuperAdmin(role: AuthRole): boolean {
  return role === 'SUPER_ADMIN'
}

export function getRoleDisplayLabel(role: AuthRole): string {
  switch (role) {
    case 'user':
      return 'User'
    case 'merchant':
      return 'Merchant'
    case 'ADMIN':
      return 'Admin'
    case 'SUPER_ADMIN':
      return 'Super Admin'
  }
}
