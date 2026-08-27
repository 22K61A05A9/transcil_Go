import type { ReactElement } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import { getHomePathForRole } from '@/shared/auth/getHomePathForRole'
import { useAuth } from '@/shared/auth/useAuth'

/**
 * Guest-only route guard (see `shared/config/guestAccess.ts`).
 * Unauthenticated guests may proceed; authenticated sessions are redirected home.
 */
export function PublicOnlyRoute(): ReactElement {
  const { isAuthenticated, role } = useAuth()

  if (isAuthenticated && role !== null) {
    return <Navigate to={getHomePathForRole(role)} replace />
  }

  return <Outlet />
}
