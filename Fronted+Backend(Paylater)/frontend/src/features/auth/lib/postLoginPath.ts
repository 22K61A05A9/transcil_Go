import type { AuthLoginActor } from '@/features/auth/types'

/**
 * Post-login destinations for this step (no route guards yet).
 * Admin UI covers both ADMIN and SUPER_ADMIN backend roles.
 */
export function getPostLoginPath(actor: AuthLoginActor): string {
  switch (actor) {
    case 'user':
      return '/user'
    case 'merchant':
      return '/merchant'
    case 'admin':
      return '/admin'
  }
}
