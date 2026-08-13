import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  getMerchantById,
  updateMerchantProfile,
} from '@/features/merchant/api/merchantApi'
import type { MerchantProfile } from '@/features/merchant/types'
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

export function MerchantProfilePage(): ReactElement {
  const navigate = useNavigate()
  const { userId, logout } = useAuth()

  const [profile, setProfile] = useState<MerchantProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isForbidden, setIsForbidden] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
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
      const data = await getMerchantById(userId)
      setProfile(data)
      setEditName(data.merchant_name)
      setEditPhone(data.phone_number)
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
          error.message || 'You do not have access to this merchant profile.',
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
    setEditName(profile.merchant_name)
    setEditPhone(profile.phone_number)
    setSaveError(null)
    setIsEditing(true)
  }

  const handleCancelEdit = (): void => {
    if (profile !== null) {
      setEditName(profile.merchant_name)
      setEditPhone(profile.phone_number)
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
    const trimmedPhone = editPhone.trim()

    if (trimmedName.length < 2) {
      setSaveError('Merchant name must be at least 2 characters.')
      return
    }
    if (trimmedName.length > 120) {
      setSaveError('Merchant name must be 120 characters or fewer.')
      return
    }
    if (trimmedPhone.length > 0 && trimmedPhone.length < 7) {
      setSaveError('Phone number must be at least 7 digits when provided.')
      return
    }

    const unchanged =
      trimmedName === profile.merchant_name &&
      trimmedPhone === profile.phone_number.trim()
    if (unchanged) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      await updateMerchantProfile(userId, {
        merchant_name: trimmedName,
        phone_number: trimmedPhone,
      })
      setProfile({
        ...profile,
        merchant_name: trimmedName,
        phone_number: trimmedPhone,
      })
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
            to="/merchant"
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

  const phoneDisplay =
    profile.phone_number.trim() === '' ? '—' : profile.phone_number

  return (
    <div className="profile-page">
      <header className="user-dashboard__welcome">
        <p className="user-dashboard__eyebrow">Merchant account</p>
        <h1 className="user-dashboard__title">Profile</h1>
        <p className="user-dashboard__subtitle">
          Manage your business contact details. Commission and email are managed
          by PayLater administrators.
        </p>
        <div className="profile-page__header-actions">
          <Link
            className="user-dashboard__action user-dashboard__action--enabled"
            to="/merchant"
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
        aria-label="Merchant profile details"
      >
        {isEditing ? (
          <form className="profile-page__form" onSubmit={(e) => void handleSave(e)}>
            <h2 className="user-dashboard__section-title">Edit profile</h2>
            {saveError !== null ? (
              <p className="profile-page__form-error" role="alert">{saveError}</p>
            ) : null}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="merchant-profile-name">
                Merchant name
              </label>
              <input
                id="merchant-profile-name"
                type="text"
                className="admin-form-input"
                value={editName}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditName(e.target.value)
                }
                required
                minLength={2}
                maxLength={120}
                disabled={isSaving}
                autoComplete="organization"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="merchant-profile-phone">
                Phone number
              </label>
              <input
                id="merchant-profile-phone"
                type="tel"
                className="admin-form-input"
                value={editPhone}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEditPhone(e.target.value)
                }
                maxLength={20}
                disabled={isSaving}
                autoComplete="tel"
                placeholder="Optional"
              />
            </div>
            <p className="profile-page__readonly-hint">
              Email and commission percentage cannot be changed from this screen.
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
            <h2 className="user-dashboard__section-title">Business details</h2>
            <dl className="profile-page__grid">
              <div className="profile-page__field">
                <dt>Merchant ID</dt>
                <dd>{profile.id}</dd>
              </div>
              <div className="profile-page__field">
                <dt>Merchant name</dt>
                <dd>{profile.merchant_name}</dd>
              </div>
              <div className="profile-page__field">
                <dt>Email</dt>
                <dd>{profile.email}</dd>
              </div>
              <div className="profile-page__field">
                <dt>Phone number</dt>
                <dd>{phoneDisplay}</dd>
              </div>
              <div className="profile-page__field">
                <dt>Commission percentage</dt>
                <dd>{profile.commission_percentage}</dd>
              </div>
            </dl>
          </>
        )}
      </section>

      {!isEditing ? (
        <p className="profile-page__note" role="note">
          You can only edit your own merchant profile. Contact an administrator
          to update email or commission settings.
        </p>
      ) : null}
    </div>
  )
}
