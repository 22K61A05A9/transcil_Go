import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { getUserById, updateUserName } from '@/features/user/api/userApi'
import type { UserProfile } from '@/features/user/types'
import { formatMoneyDisplay } from '@/features/user/lib/money'
import { isApiError } from '@/shared/api/errors'
import { useAuth } from '@/shared/auth/useAuth'
import { showToast } from '@/shared/ui/toastState'
import '@/features/user/styles/user-dashboard.css'
import '@/shared/styles/profile-page.css'

function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 0) {
      return 'Unable to reach the server. Check your connection and try again.'
    }
    if (error.status >= 500) {
      return 'Something went wrong on our side. Please try again.'
    }
    return error.message || 'Unable to load your profile.'
  }
  return 'Unable to load your profile.'
}

export function UserProfilePage(): ReactElement {
  const navigate = useNavigate()
  const { userId, logout } = useAuth()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isForbidden, setIsForbidden] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const loadProfile = useCallback(async (): Promise<void> => {
    if (userId === null) {
      return
    }

    setIsLoading(true)
    setErrorMessage(null)
    setIsForbidden(false)

    try {
      const data = await getUserById(userId)
      setProfile(data)
      setEditName(data.user_name)
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        logout()
        void navigate('/login', { replace: true })
        return
      }
      setProfile(null)
      if (isApiError(error) && error.status === 403) {
        setIsForbidden(true)
        setErrorMessage(
          error.message || 'You do not have access to this profile.',
        )
      } else {
        setErrorMessage(getErrorMessage(error))
      }
    } finally {
      setIsLoading(false)
    }
  }, [userId, logout, navigate])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile, reloadKey])

  const handleStartEdit = (): void => {
    if (profile === null) {
      return
    }
    setEditName(profile.user_name)
    setSaveError(null)
    setIsEditing(true)
  }

  const handleCancelEdit = (): void => {
    if (profile !== null) {
      setEditName(profile.user_name)
    }
    setSaveError(null)
    setIsEditing(false)
  }

  const handleSave = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    if (userId === null || profile === null) {
      return
    }

    const trimmedName = editName.trim()
    if (trimmedName.length < 2) {
      setSaveError('Display name must be at least 2 characters.')
      return
    }
    if (trimmedName.length > 80) {
      setSaveError('Display name must be 80 characters or fewer.')
      return
    }
    if (trimmedName === profile.user_name) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      await updateUserName(userId, { user_name: trimmedName })
      setProfile({ ...profile, user_name: trimmedName })
      setIsEditing(false)
      showToast('Profile updated successfully', 'success')
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        logout()
        void navigate('/login', { replace: true })
        return
      }
      const msg = isApiError(error)
        ? error.message || 'Unable to update profile.'
        : 'Unable to update profile.'
      setSaveError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  if (userId === null) {
    return (
      <div className="user-dashboard__status" role="status">
        <p className="user-dashboard__loading">Sign in required.</p>
      </div>
    )
  }

  if (isLoading && profile === null && errorMessage === null) {
    return (
      <div className="user-dashboard__status" role="status" aria-live="polite">
        <p className="user-dashboard__loading">Loading your profile…</p>
      </div>
    )
  }

  if (errorMessage !== null && profile === null) {
    return (
      <div className="user-dashboard__error" role="alert">
        <h1 className="user-dashboard__error-title">
          {isForbidden ? 'Access denied' : 'Unable to load profile'}
        </h1>
        <p className="user-dashboard__error-message">{errorMessage}</p>
        {isForbidden ? (
          <Link
            className="user-dashboard__action user-dashboard__action--enabled"
            to="/user"
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
      </div>
    )
  }

  if (profile === null) {
    return (
      <div className="user-dashboard__status" role="status">
        <p className="user-dashboard__loading">No profile data available.</p>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <header className="user-dashboard__welcome">
        <p className="user-dashboard__eyebrow">Customer account</p>
        <h1 className="user-dashboard__title">Profile</h1>
        <p className="user-dashboard__subtitle">
          View your account details and update your display name.
        </p>
        <div className="profile-page__header-actions">
          <Link
            className="user-dashboard__action user-dashboard__action--enabled"
            to="/user"
          >
            Back to Dashboard
          </Link>
          {!isEditing ? (
            <button
              type="button"
              className="user-dashboard__retry"
              onClick={handleStartEdit}
            >
              Edit Profile
            </button>
          ) : null}
        </div>
      </header>

      <section
        className="profile-page__card"
        aria-label="Account profile details"
      >
        {isEditing ? (
          <form className="profile-page__form" onSubmit={(e) => void handleSave(e)}>
            <h2 className="user-dashboard__section-title">Edit profile</h2>
            {saveError !== null ? (
              <p className="profile-page__form-error" role="alert">{saveError}</p>
            ) : null}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="user-profile-name">
                Display name
              </label>
              <input
                id="user-profile-name"
                type="text"
                className="admin-form-input"
                value={editName}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditName(e.target.value)
                }
                required
                minLength={2}
                maxLength={80}
                disabled={isSaving}
                autoComplete="name"
              />
            </div>
            <p className="profile-page__readonly-hint">
              Credit limit and current due are managed by PayLater administrators.
            </p>
            <div className="profile-page__form-actions">
              <button
                type="button"
                className="user-dashboard__retry"
                style={{ background: 'var(--color-secondary)' }}
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button type="submit" className="user-dashboard__retry" disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <h2 className="user-dashboard__section-title">Account details</h2>
            <dl className="profile-page__grid">
              <div className="profile-page__field">
                <dt>User ID</dt>
                <dd>{profile.id}</dd>
              </div>
              <div className="profile-page__field">
                <dt>Display name</dt>
                <dd>{profile.user_name}</dd>
              </div>
              <div className="profile-page__field">
                <dt>Credit limit</dt>
                <dd>{formatMoneyDisplay(profile.credit_limit)}</dd>
              </div>
              <div className="profile-page__field">
                <dt>Current due</dt>
                <dd>{formatMoneyDisplay(profile.current_due)}</dd>
              </div>
            </dl>
          </>
        )}
      </section>

      {!isEditing ? (
        <p className="profile-page__note" role="note">
          You can only edit your own profile. Credit limit and outstanding balance
          cannot be changed from this screen.
        </p>
      ) : null}
    </div>
  )
}
