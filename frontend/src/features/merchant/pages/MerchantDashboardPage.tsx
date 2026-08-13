import {
  useCallback,
  useEffect,
  useState,
  type ReactElement,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  getMerchantById,
  getMerchantTransactions,
} from '@/features/merchant/api/merchantApi'
import {
  buildMerchantDashboardMetrics,
  takeRecentMerchantTransactions,
  type MerchantDashboardMetrics,
} from '@/features/merchant/lib/dashboardMetrics'
import type {
  MerchantProfile,
  MerchantTransaction,
} from '@/features/merchant/types'
import { formatMoneyDisplay } from '@/features/user/lib/money'
import { isApiError } from '@/shared/api/errors'
import { useAuth } from '@/shared/auth/useAuth'
import '@/features/user/styles/user-dashboard.css'
import '@/features/merchant/styles/merchant-dashboard.css'
import '@/features/admin/styles/admin-dashboard.css'

const RECENT_LIMIT = 5

type MerchantDashboardData = {
  profile: MerchantProfile
  metrics: MerchantDashboardMetrics | null
  recent: MerchantTransaction[]
  hasTransactions: boolean
  transactionsError: string | null
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    if (error.status === 0) {
      return 'Unable to reach the server. Check your connection and try again.'
    }
    if (error.status >= 500) {
      return 'Something went wrong on our side. Please try again.'
    }
    return error.message || fallback
  }
  return fallback
}

export function MerchantDashboardPage(): ReactElement {
  const navigate = useNavigate()
  const { userId, logout } = useAuth()

  const [data, setData] = useState<MerchantDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const loadDashboard = useCallback(async (): Promise<void> => {
    if (userId === null) {
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    const profileResult = await Promise.allSettled([
      getMerchantById(userId),
      getMerchantTransactions(userId),
    ])

    const [profileOutcome, transactionsOutcome] = profileResult

    const handleUnauthorized = (error: unknown): boolean => {
      if (isApiError(error) && error.status === 401) {
        logout()
        void navigate('/login', { replace: true })
        return true
      }
      return false
    }

    if (profileOutcome.status === 'rejected') {
      if (handleUnauthorized(profileOutcome.reason)) {
        return
      }
      setData(null)
      setErrorMessage(
        getErrorMessage(profileOutcome.reason, 'Unable to load your dashboard.'),
      )
      setIsLoading(false)
      return
    }

    const profile = profileOutcome.value

    if (transactionsOutcome.status === 'rejected') {
      if (handleUnauthorized(transactionsOutcome.reason)) {
        return
      }
      setData({
        profile,
        metrics: null,
        recent: [],
        hasTransactions: false,
        transactionsError: getErrorMessage(
          transactionsOutcome.reason,
          'Unable to load merchant transactions.',
        ),
      })
      setIsLoading(false)
      return
    }

    const transactions = transactionsOutcome.value
    setData({
      profile,
      metrics: buildMerchantDashboardMetrics(transactions),
      recent: takeRecentMerchantTransactions(transactions, RECENT_LIMIT),
      hasTransactions: transactions.length > 0,
      transactionsError: null,
    })
    setIsLoading(false)
  }, [userId, logout, navigate])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard, reloadKey])

  if (userId === null) {
    return (
      <div className="user-dashboard__status" role="status">
        <p className="user-dashboard__loading">Sign in required.</p>
      </div>
    )
  }

  if (isLoading && data === null) {
    return (
      <div className="user-dashboard__status" role="status" aria-live="polite">
        <p className="user-dashboard__loading">Loading your merchant dashboard…</p>
      </div>
    )
  }

  if (errorMessage !== null && data === null) {
    return (
      <div className="user-dashboard__error" role="alert">
        <h1 className="user-dashboard__error-title">Unable to load dashboard</h1>
        <p className="user-dashboard__error-message">{errorMessage}</p>
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

  if (data === null) {
    return (
      <div className="user-dashboard__status" role="status">
        <p className="user-dashboard__loading">No dashboard data available.</p>
      </div>
    )
  }

  const { profile, metrics, recent, hasTransactions, transactionsError } = data
  const phoneDisplay =
    profile.phone_number.trim() === '' ? '—' : profile.phone_number

  return (
    <div className="merchant-dashboard user-dashboard">
      <header className="user-dashboard__welcome">
        <p className="user-dashboard__eyebrow">Merchant dashboard</p>
        <h1 className="user-dashboard__title">Welcome, {profile.merchant_name}</h1>
        <p className="user-dashboard__subtitle">
          Business overview based on your merchant profile and purchase ledger.
        </p>
      </header>

      <section
        className="user-dashboard__section"
        aria-label="Business information"
      >
        <h2 className="user-dashboard__section-title">Business information</h2>
        <dl className="merchant-dashboard__profile">
          <div className="merchant-dashboard__profile-item">
            <dt>Merchant name</dt>
            <dd>{profile.merchant_name}</dd>
          </div>
          <div className="merchant-dashboard__profile-item">
            <dt>Email</dt>
            <dd>{profile.email}</dd>
          </div>
          <div className="merchant-dashboard__profile-item">
            <dt>Phone</dt>
            <dd>{phoneDisplay}</dd>
          </div>
          <div className="merchant-dashboard__profile-item">
            <dt>Commission percentage</dt>
            <dd>{profile.commission_percentage}</dd>
          </div>
        </dl>
      </section>

      <section aria-label="Ledger summary" className="user-dashboard__cards merchant-dashboard__cards">
        {transactionsError !== null ? (
          <div className="user-dashboard__error merchant-dashboard__inline-error" role="alert">
            <p className="user-dashboard__error-message">{transactionsError}</p>
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
        ) : metrics === null ? (
          <p className="user-dashboard__empty">Summary unavailable.</p>
        ) : (
          <>
            <article className="user-dashboard__card">
              <p className="user-dashboard__card-label">Total Transactions</p>
              <p className="user-dashboard__card-value">
                {metrics.totalTransactions}
              </p>
            </article>
            <article className="user-dashboard__card">
              <p className="user-dashboard__card-label">Total Purchase Amount</p>
              <p className="user-dashboard__card-value">
                {formatMoneyDisplay(metrics.totalPurchaseAmount)}
              </p>
            </article>
            <article className="user-dashboard__card">
              <p className="user-dashboard__card-label">Total Payback Amount</p>
              <p className="user-dashboard__card-value">
                {formatMoneyDisplay(metrics.totalPaybackAmount)}
              </p>
            </article>
            <article className="user-dashboard__card">
              <p className="user-dashboard__card-label">Total Commission</p>
              <p className="user-dashboard__card-value">
                {formatMoneyDisplay(metrics.totalCommission)}
              </p>
            </article>
          </>
        )}
      </section>

      <section className="user-dashboard__section" aria-label="Recent transactions">
        <h2 className="user-dashboard__section-title">Recent transactions</h2>
        {transactionsError !== null ? (
          <p className="user-dashboard__empty">
            Transactions could not be loaded. Use Retry above to try again.
          </p>
        ) : !hasTransactions ? (
          <p className="user-dashboard__empty">
            No transactions yet. Customer purchases at your store will appear here.
          </p>
        ) : (
          <>
            <div className="user-dashboard__table-wrap admin-users__table-desktop">
              <table className="user-dashboard__table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">User ID</th>
                  <th scope="col">Type</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Commission</th>
                  <th scope="col">Commission %</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.id}</td>
                    <td>{tx.user_id}</td>
                    <td>
                      <span
                        className={
                          tx.transaction_type === 'PURCHASE'
                            ? 'user-dashboard__type user-dashboard__type--purchase'
                            : 'user-dashboard__type user-dashboard__type--payback'
                        }
                      >
                        {tx.transaction_type}
                      </span>
                    </td>
                    <td>{formatMoneyDisplay(tx.amount)}</td>
                    <td>{formatMoneyDisplay(tx.commission)}</td>
                    <td>{tx.commission_percentage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            <div className="admin-users__mobile-cards">
              {recent.map((tx) => (
                <div key={tx.id} className="admin-users__card">
                  <div className="admin-users__card-header">
                    <span
                      className={
                        tx.transaction_type === 'PURCHASE'
                          ? 'user-dashboard__type user-dashboard__type--purchase'
                          : 'user-dashboard__type user-dashboard__type--payback'
                      }
                    >
                      {tx.transaction_type}
                    </span>
                    <span className="admin-users__card-id">ID: {tx.id}</span>
                  </div>
                  <div className="admin-users__card-body">
                    <div className="admin-users__card-row">
                      <span className="admin-users__card-label">User ID</span>
                      <span className="admin-users__card-value">{tx.user_id}</span>
                    </div>
                    <div className="admin-users__card-row">
                      <span className="admin-users__card-label">Amount</span>
                      <span className="admin-users__card-value">{formatMoneyDisplay(tx.amount)}</span>
                    </div>
                    <div className="admin-users__card-row">
                      <span className="admin-users__card-label">Commission</span>
                      <span className="admin-users__card-value">{formatMoneyDisplay(tx.commission)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="user-dashboard__section" aria-label="Quick actions">
        <h2 className="user-dashboard__section-title">Quick actions</h2>
        <div className="user-dashboard__actions merchant-dashboard__actions">
          <Link
            className="user-dashboard__action user-dashboard__action--enabled"
            to="/merchant/transactions"
          >
            View Transactions
          </Link>
          <Link
            className="user-dashboard__action user-dashboard__action--enabled"
            to="/merchant/profile"
          >
            Profile
          </Link>
        </div>
      </section>
    </div>
  )
}
