import {
  useCallback,
  useEffect,
  useState,
  type ReactElement,
} from 'react'
import { Link } from 'react-router-dom'

import { getAdminById } from '@/features/admin/api/adminApi'
import type { AdminProfile } from '@/features/admin/types'
import { isApiError } from '@/shared/api/errors'
import { mapApiErrorMessage } from '@/shared/lib/apiErrorMessage'
import { useAuth } from '@/shared/auth/useAuth'
import { getRoleDisplayLabel } from '@/shared/auth/roles'
import { PageLoadError } from '@/shared/ui/PageLoadError'
import { PageLoadingState } from '@/shared/ui/PageLoadingState'
import '@/shared/styles/page-shell.css'
import '@/features/admin/styles/admin-dashboard.css'
import '@/shared/styles/profile-page.css'

export function AdminProfilePage(): ReactElement {
  const { role, userId } = useAuth()
  const isSuperAdmin = role === 'SUPER_ADMIN'

  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isForbidden, setIsForbidden] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const loadProfile = useCallback(async (): Promise<void> => {
    if (userId === null) {
      return
    }

    setIsLoading(true)
    setErrorMessage(null)
    setIsForbidden(false)

    try {
      const data = await getAdminById(userId)
      setProfile(data)
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        return
      }
      setProfile(null)
      if (isApiError(error) && error.status === 403) {
        setIsForbidden(true)
        setErrorMessage(
          error.message || 'You do not have access to this admin profile.',
        )
      } else {
        setErrorMessage(mapApiErrorMessage(error, 'Unable to load your profile.'))
      }
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile, reloadKey])

  if (userId === null) {
    return <PageLoadingState message="Sign in required." />
  }

  if (isLoading && profile === null && errorMessage === null) {
    return <PageLoadingState message="Loading your profile…" live />
  }

  if (errorMessage !== null && profile === null) {
    return (
      <PageLoadError
        title={isForbidden ? 'Access denied' : 'Unable to load profile'}
        message={errorMessage}
      >
        {isForbidden ? (
          <Link
            className="user-dashboard__action user-dashboard__action--enabled"
            to="/admin"
          >
            Back to Dashboard
          </Link>
        ) : (
          <button
            type="button"
            className="user-dashboard__retry"
            onClick={() => {
              setReloadKey((key) => key + 1)
            }}
          >
            Retry
          </button>
        )}
      </PageLoadError>
    )
  }

  if (profile === null) {
    return <PageLoadingState message="No profile data available." />
  }

  const roleLabel = getRoleDisplayLabel(profile.role)

  return (
    <div className="profile-page admin-dashboard pl-page">
      <header className="user-dashboard__welcome">
        <p className="user-dashboard__eyebrow admin-dashboard__eyebrow">
          Administration
        </p>
        <h1 className="user-dashboard__title">My Profile</h1>
        <p className="user-dashboard__subtitle">
          Your administrator account details. Profile updates are managed through
          platform administration.
        </p>
        <div className="profile-page__header-actions">
          <Link
            className="user-dashboard__action user-dashboard__action--enabled"
            to="/admin"
          >
            Back to Dashboard
          </Link>
          {isSuperAdmin ? (
            <Link
              className="user-dashboard__retry"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              to="/admin/admins"
            >
              Manage Admins
            </Link>
          ) : null}
        </div>
      </header>

      <section className="profile-page__card" aria-label="Administrator profile">
        <h2 className="user-dashboard__section-title">Account details</h2>
        <dl className="profile-page__grid">
          <div className="profile-page__field">
            <dt>Admin ID</dt>
            <dd>{profile.id}</dd>
          </div>
          <div className="profile-page__field">
            <dt>Name</dt>
            <dd>{profile.admin_name}</dd>
          </div>
          <div className="profile-page__field">
            <dt>Email</dt>
            <dd>{profile.email}</dd>
          </div>
          <div className="profile-page__field">
            <dt>Role</dt>
            <dd>
              <span
                className={
                  profile.role === 'SUPER_ADMIN'
                    ? 'profile-page__role-badge profile-page__role-badge--super'
                    : 'profile-page__role-badge profile-page__role-badge--admin'
                }
              >
                {roleLabel}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <section className="profile-page__card" aria-label="Role permissions">
        <h2 className="user-dashboard__section-title">Access & permissions</h2>
        <ul className="admin-profile__permissions">
          <li>View users, merchants, transactions, and platform reports</li>
          <li>Manage customer and merchant records (read/update/delete)</li>
          {isSuperAdmin ? (
            <>
              <li>Create and delete administrator accounts</li>
              <li>Full write access across admin management screens</li>
            </>
          ) : (
            <li>Read-only access to administrator account management</li>
          )}
        </ul>
      </section>

      <p className="profile-page__note" role="note">
        Administrator profiles cannot be self-edited. Super Admins can create or
        remove admin accounts from the Admins screen.
      </p>
    </div>
  )
}
