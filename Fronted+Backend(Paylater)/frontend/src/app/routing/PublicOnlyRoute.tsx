import type { ReactElement } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import { getHomePathForRole } from '@/shared/auth/getHomePathForRole'
import { useAuth } from '@/shared/auth/useAuth'

/**
 * For public routes such as /login.
 * Authenticated visitors are sent to their role home area.
 */
export function PublicOnlyRoute(): ReactElement {
  const { isAuthenticated, role } = useAuth()

  if (isAuthenticated && role !== null) {
    return <Navigate to={getHomePathForRole(role)} replace />
  }

  return <Outlet />
}
