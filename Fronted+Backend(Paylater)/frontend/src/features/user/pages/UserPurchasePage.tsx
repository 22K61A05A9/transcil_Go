import {
  useCallback,
  useEffect,
  useId,
  useState,
  type FormEvent,
  type ReactElement,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  createPurchase,
  getAvailableMerchants,
} from '@/features/user/api/userApi'
import { centsToMoney, moneyToCents } from '@/features/user/lib/money'
import type {
  AvailableMerchant,
  CreatePurchaseRequest,
} from '@/features/user/types'
import { isApiError } from '@/shared/api/errors'
import { useAuth } from '@/shared/auth/useAuth'
import { showToast } from '@/shared/ui/toastState'
import '@/features/user/styles/user-dashboard.css'
import '@/features/user/styles/user-purchase.css'

function normalizePurchaseAmount(raw: string): string | null {
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

function parseSelectedMerchantId(raw: string): number | null {
  if (raw === '') {
    return null
  }
  if (!/^\d+$/.test(raw)) {
    return null
  }
  const value = Number(raw)
  if (!Number.isSafeInteger(value) || value <= 0) {
    return null
  }
  return value
}

function getPurchaseErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 0) {
      return 'Unable to reach the server. Check your connection and try again.'
    }
    if (error.status === 400) {
      return error.message || 'Purchase could not be completed. Check merchant and amount.'
    }
    if (error.status >= 500) {
      return 'Something went wrong on our side. Please try again.'
    }
    return error.message || 'Unable to complete the purchase.'
  }
  return 'Unable to complete the purchase.'
}

function getCatalogErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 0) {
      return 'Unable to reach the server. Check your connection and try again.'
    }
    return error.message || 'Unable to load merchants.'
  }
  return 'Unable to load merchants.'
}

export function UserPurchasePage(): ReactElement {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const merchantField = useId()
  const amountField = useId()
  const errorId = useId()
  const helpMerchantId = useId()
  const helpAmountId = useId()

  const [merchants, setMerchants] = useState<AvailableMerchant[]>([])
  const [isLoadingMerchants, setIsLoadingMerchants] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [selectedMerchantId, setSelectedMerchantId] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [clientError, setClientError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const displayError = clientError ?? apiError
  const hasCatalog = !isLoadingMerchants && catalogError === null && merchants.length > 0
  const selectedId = parseSelectedMerchantId(selectedMerchantId)
  const normalizedAmount = normalizePurchaseAmount(amountInput)
  const canSubmit =
    hasCatalog &&
    selectedId !== null &&
    normalizedAmount !== null &&
    !isSubmitting

  const loadMerchants = useCallback(async (): Promise<void> => {
    setIsLoadingMerchants(true)
    setCatalogError(null)

    try {
      const list = await getAvailableMerchants()
      setMerchants(list)
      setSelectedMerchantId('')
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        logout()
        void navigate('/login', { replace: true })
        return
      }
      setMerchants([])
      setSelectedMerchantId('')
      setCatalogError(getCatalogErrorMessage(error))
    } finally {
      setIsLoadingMerchants(false)
    }
  }, [logout, navigate])

  useEffect(() => {
    void loadMerchants()
  }, [loadMerchants, reloadKey])

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (!canSubmit || selectedId === null || normalizedAmount === null) {
      return
    }

    setClientError(null)
    setApiError(null)

    const merchantExists = merchants.some((merchant) => merchant.id === selectedId)
    if (!merchantExists) {
      setClientError('Select a merchant from the list.')
      return
    }

    const payload: CreatePurchaseRequest = {
      merchant_id: selectedId,
      amount: normalizedAmount,
    }

    setIsSubmitting(true)
    try {
      const response = await createPurchase(payload)
      showToast(response.message || 'Purchase successful!', 'success')
      setSelectedMerchantId('')
      setAmountInput('')
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        logout()
        void navigate('/login', { replace: true })
        return
      }
      const errMsg = getPurchaseErrorMessage(error)
      setApiError(errMsg)
      showToast(errMsg, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="user-purchase">
      <header className="user-dashboard__welcome">
        <p className="user-dashboard__eyebrow">Customer purchase</p>
        <h1 className="user-dashboard__title">Make a purchase</h1>
        <p className="user-dashboard__subtitle">
          Charge your PayLater credit at a merchant. The backend validates credit
          limit, commission, and updates your current due.
        </p>
      </header>

      <section className="user-dashboard__section" aria-label="Purchase form">
        {isLoadingMerchants ? (
          <p className="user-dashboard__loading" role="status" aria-live="polite">
            Loading merchants…
          </p>
        ) : null}

        {!isLoadingMerchants && catalogError !== null ? (
          <div className="user-dashboard__error" role="alert">
            <p className="user-dashboard__error-message">{catalogError}</p>
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
        ) : null}

        {!isLoadingMerchants && catalogError === null && merchants.length === 0 ? (
          <p className="user-dashboard__empty" role="status">
            No merchants are currently available.
          </p>
        ) : null}

        {hasCatalog ? (
          <form
            className="user-purchase__form"
            onSubmit={(event) => {
              void handleSubmit(event)
            }}
            noValidate
          >
            <div className="user-purchase__field">
              <label className="user-purchase__label" htmlFor={merchantField}>
                Select Merchant
              </label>
              <select
                id={merchantField}
                className="user-purchase__input user-purchase__select"
                name="merchant_id"
                value={selectedMerchantId}
                required
                disabled={isSubmitting || isLoadingMerchants}
                aria-describedby={helpMerchantId}
                {...(displayError
                  ? {
                      'aria-invalid': true as const,
                      'aria-describedby': `${helpMerchantId} ${errorId}`,
                    }
                  : {})}
                onChange={(event) => {
                  setSelectedMerchantId(event.target.value)
                  setClientError(null)
                  setApiError(null)
                }}
              >
                <option value="">Select a merchant</option>
                {merchants.map((merchant) => (
                  <option key={merchant.id} value={String(merchant.id)}>
                    {merchant.merchant_name}
                  </option>
                ))}
              </select>
              <p id={helpMerchantId} className="user-purchase__help">
                Choose the merchant for this purchase. Only the merchant name is
                shown.
              </p>
            </div>

            <div className="user-purchase__field">
              <label className="user-purchase__label" htmlFor={amountField}>
                Amount
              </label>
              <input
                id={amountField}
                className="user-purchase__input"
                name="amount"
                inputMode="decimal"
                autoComplete="off"
                placeholder="e.g. 100.00"
                value={amountInput}
                required
                disabled={isSubmitting}
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
                Purchase amount in your account currency, up to two decimal places.
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
                disabled={!canSubmit}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? 'Submitting purchase…' : 'Submit purchase'}
              </button>
              <Link className="user-purchase__cancel" to="/user/transactions">
                Cancel / Back to Transactions
              </Link>
            </div>
          </form>
        ) : null}
      </section>
    </div>
  )
}
