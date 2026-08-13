import {
  useCallback,
  useEffect,
  useId,
  useState,
  type FormEvent,
  type ReactElement,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { createPayback, getUserById } from '@/features/user/api/userApi'
import {
  centsToMoney,
  formatMoneyDisplay,
  moneyToCents,
} from '@/features/user/lib/money'
import type { CreatePaybackRequest } from '@/features/user/types'
import { isApiError } from '@/shared/api/errors'
import { useAuth } from '@/shared/auth/useAuth'
import { showToast } from '@/shared/ui/toastState'
import '@/features/user/styles/user-dashboard.css'
import '@/features/user/styles/user-purchase.css'
import '@/features/user/styles/user-payback.css'

function normalizePaybackAmount(raw: string): string | null {
  try {
    const cents = moneyToCents(raw)
    if (cents <= 0n) {
      return null
    }
    return centsToMoney(cents)
  } catch {
    return null
  }
}

function getPaybackErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 0) {
      return 'Unable to reach the server. Check your connection and try again.'
    }
    if (error.status === 400) {
      return error.message || 'Payback could not be completed. Check the amount.'
    }
    if (error.status >= 500) {
      return 'Something went wrong on our side. Please try again.'
    }
    return error.message || 'Unable to complete the payback.'
  }
  return 'Unable to complete the payback.'
}

export function UserPaybackPage(): ReactElement {
  const navigate = useNavigate()
  const { userId, logout } = useAuth()

  const amountField = useId()
  const errorId = useId()
  const helpAmountId = useId()

  const [currentDue, setCurrentDue] = useState<string | null>(null)
  const [isLoadingDue, setIsLoadingDue] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [amountInput, setAmountInput] = useState('')
  const [clientError, setClientError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const displayError = clientError ?? apiError

  const loadCurrentDue = useCallback(async (): Promise<void> => {
    if (userId === null) {
      return
    }

    setIsLoadingDue(true)
    setLoadError(null)

    try {
      const profile = await getUserById(userId)
      setCurrentDue(profile.current_due)
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        logout()
        void navigate('/login', { replace: true })
        return
      }
      setCurrentDue(null)
      setLoadError(
        isApiError(error)
          ? error.status === 0
            ? 'Unable to reach the server. Check your connection and try again.'
            : error.message || 'Unable to load your current due.'
          : 'Unable to load your current due.',
      )
    } finally {
      setIsLoadingDue(false)
    }
  }, [userId, logout, navigate])

  useEffect(() => {
    void loadCurrentDue()
  }, [loadCurrentDue, reloadKey])

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (isSubmitting || currentDue === null || userId === null) {
      return
    }

    const subjectUserId = userId

    setClientError(null)
    setApiError(null)

    const amount = normalizePaybackAmount(amountInput)
    if (amount === null) {
      setClientError('Enter a valid payback amount greater than zero (up to 2 decimal places).')
      return
    }

    try {
      if (moneyToCents(amount) > moneyToCents(currentDue)) {
        setClientError(
          `Amount cannot exceed your current due of ${formatMoneyDisplay(currentDue)}.`,
        )
        return
      }
    } catch {
      setClientError('Unable to validate amount against current due.')
      return
    }

    const payload: CreatePaybackRequest = { amount }

    setIsSubmitting(true)
    try {
      const response = await createPayback(payload)
      showToast(response.message || 'Payment submitted successfully!', 'success')
      setAmountInput('')
      try {
        const refreshed = await getUserById(subjectUserId)
        setCurrentDue(refreshed.current_due)
      } catch {
        // Success already confirmed; keep prior due if refresh fails.
      }
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        logout()
        void navigate('/login', { replace: true })
        return
      }
      const errMsg = getPaybackErrorMessage(error)
      setApiError(errMsg)
      showToast(errMsg, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (userId === null) {
    return (
      <div className="user-dashboard__status" role="status">
        <p className="user-dashboard__loading">Sign in required.</p>
      </div>
    )
  }

  if (isLoadingDue && currentDue === null && loadError === null) {
    return (
      <div className="user-dashboard__status" role="status" aria-live="polite">
        <p className="user-dashboard__loading">Loading your current due…</p>
      </div>
    )
  }

  if (loadError !== null && currentDue === null) {
    return (
      <div className="user-dashboard__error" role="alert">
        <h1 className="user-dashboard__error-title">Unable to load payback</h1>
        <p className="user-dashboard__error-message">{loadError}</p>
        <button
          type="button"
          className="user-dashboard__retry"
          onClick={() => {
            setReloadKey((key) => key + 1)
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  const dueDisplay = currentDue === null ? '—' : formatMoneyDisplay(currentDue)
  const hasNoDue =
    currentDue !== null &&
    (() => {
      try {
        return moneyToCents(currentDue) <= 0n
      } catch {
        return false
      }
    })()

  return (
    <div className="user-payback">
      <header className="user-dashboard__welcome">
        <p className="user-dashboard__eyebrow">Customer payment</p>
        <h1 className="user-dashboard__title">Pay back</h1>
        <p className="user-dashboard__subtitle">
          Reduce your outstanding PayLater balance. Partial or full payments are
          accepted up to your current due.
        </p>
      </header>

      <section className="user-dashboard__cards" aria-label="Outstanding balance">
        <article className="user-dashboard__card">
          <p className="user-dashboard__card-label">Current Due</p>
          <p className="user-dashboard__card-value">{dueDisplay}</p>
        </article>
      </section>

      <section className="user-dashboard__section" aria-label="Payback form">
        {hasNoDue ? (
          <p className="user-dashboard__empty">
            You have no outstanding balance to pay right now.
          </p>
        ) : (
          <form
            className="user-purchase__form"
            onSubmit={(event) => {
              void handleSubmit(event)
            }}
            noValidate
          >
            <div className="user-purchase__field">
              <label className="user-purchase__label" htmlFor={amountField}>
                Payback amount
              </label>
              <input
                id={amountField}
                className="user-purchase__input"
                name="amount"
                inputMode="decimal"
                autoComplete="off"
                placeholder="e.g. 50.00"
                value={amountInput}
                required
                disabled={isSubmitting || currentDue === null}
                aria-describedby={helpAmountId}
                {...(displayError
                  ? {
                      'aria-invalid': true as const,
                      'aria-describedby': `${helpAmountId} ${errorId}`,
                    }
                  : {})}
                onChange={(event) => {
                  setAmountInput(event.target.value)
                  setClientError(null)
                  setApiError(null)
                }}
              />
              <p id={helpAmountId} className="user-purchase__help">
                Enter an amount greater than zero and not exceeding your current
                due{currentDue ? ` (${formatMoneyDisplay(currentDue)})` : ''}.
              </p>
            </div>

            {displayError ? (
              <p
                id={errorId}
                className="user-purchase__error"
                role="alert"
                aria-live="assertive"
              >
                {displayError}
              </p>
            ) : null}

            <div className="user-purchase__actions">
              <button
                type="submit"
                className="user-purchase__submit"
                disabled={isSubmitting || currentDue === null}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? 'Submitting payback…' : 'Submit payback'}
              </button>
              <Link className="user-purchase__cancel" to="/user/transactions">
                Cancel / Back to Transactions
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
