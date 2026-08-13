import type { AuthRole } from '@/shared/auth/types'

/**
 * Home path for an authenticated JWT role (session claim, not login-form selection).
 */
export function getHomePathForRole(role: AuthRole): string {
  switch (role) {
    case 'user':
      return '/user'
    case 'merchant':
      return '/merchant'
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return '/admin'
  }
}
