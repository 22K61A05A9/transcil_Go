import type { ReactElement } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '@/shared/auth/useAuth'
import type { AuthRole } from '@/shared/auth/types'
import { UnauthorizedPage } from '@/app/routing/UnauthorizedPage'

type ProtectedRouteProps = {
  /** When set, the session role must be one of these exact backend roles. */
  allowedRoles?: readonly AuthRole[]
}

/**
 * UX/navigation guard only — backend JWT checks remain authoritative.
 * Unauthenticated → /login. Wrong role → UnauthorizedPage.
 */
export function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps): ReactElement {
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated || role === null) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles !== undefined && !allowedRoles.includes(role)) {
    return <UnauthorizedPage />
  }

  return <Outlet />
}
