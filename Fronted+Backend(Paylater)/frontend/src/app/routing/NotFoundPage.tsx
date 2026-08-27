import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'

import { GUEST_ROUTE_PATHS } from '@/shared/config/guestAccess'
import { getHomePathForRole } from '@/shared/auth/getHomePathForRole'
import { useAuth } from '@/shared/auth/useAuth'
import '@/app/routing/not-found.css'

type NotFoundPageProps = {
  /** Full-viewport layout for the global catch-all route. */
  standalone?: boolean
}

/**
 * Shown for unknown paths. Authenticated users can return to their role home.
 */
export function NotFoundPage({ standalone = false }: NotFoundPageProps): ReactElement {
  const { isAuthenticated, role } = useAuth()

  const homePath =
    isAuthenticated && role !== null ? getHomePathForRole(role) : GUEST_ROUTE_PATHS.login

  const actionLabel =
    isAuthenticated && role !== null ? 'Go to your dashboard' : 'Back to sign in'

  return (
    <main
      className={
        standalone
          ? 'not-found-page not-found-page--standalone'
          : 'not-found-page not-found-page--embedded'
      }
    >
      <div className="not-found-page__panel">
        <p className="not-found-page__eyebrow">PayLater</p>
        <h1 className="not-found-page__title">Page not found</h1>
        <p className="not-found-page__description">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link className="not-found-page__action" to={homePath}>
          {actionLabel}
        </Link>
      </div>
    </main>
  )
}
