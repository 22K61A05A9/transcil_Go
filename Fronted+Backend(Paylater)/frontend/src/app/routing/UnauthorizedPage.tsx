import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'

import { getHomePathForRole } from '@/shared/auth/getHomePathForRole'
import { useAuth } from '@/shared/auth/useAuth'

/**
 * Shown when an authenticated session visits an area their role cannot access.
 */
export function UnauthorizedPage(): ReactElement {
  const { isAuthenticated, role } = useAuth()

  const homePath =
    isAuthenticated && role !== null ? getHomePathForRole(role) : '/login'

  const actionLabel =
    isAuthenticated && role !== null ? 'Go to your area' : 'Back to sign in'

  return (
    <main className="unauthorized-page">
      <div className="unauthorized-page__panel">
        <p className="unauthorized-page__eyebrow">PayLater</p>
        <h1 className="unauthorized-page__title">Access denied</h1>
        <p className="unauthorized-page__description">
          You do not have permission to view this page.
        </p>
        <Link className="unauthorized-page__action" to={homePath}>
          {actionLabel}
        </Link>
      </div>
    </main>
  )
}
