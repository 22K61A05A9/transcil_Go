import {
  useCallback,
  useEffect,
  useState,
  type ReactElement,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { getUserById, getUserTransactions } from '@/features/user/api/userApi'
import {
  buildDashboardMetrics,
  takeRecentTransactions,
  type UserDashboardMetrics,
} from '@/features/user/lib/dashboardMetrics'
import { formatMoneyDisplay } from '@/features/user/lib/money'
import type { UserProfile, UserTransaction } from '@/features/user/types'
import { isApiError } from '@/shared/api/errors'
import { useAuth } from '@/shared/auth/useAuth'
import '@/features/user/styles/user-dashboard.css'
import '@/features/admin/styles/admin-dashboard.css'

const RECENT_LIMIT = 5

type DashboardData = {
  profile: UserProfile
  metrics: UserDashboardMetrics
  recent: UserTransaction[]
  hasTransactions: boolean
}

function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 0) {
      return 'Unable to reach the server. Check your connection and try again.'
    }
    if (error.status >= 500) {
      return 'Something went wrong on our side. Please try again.'
    }
    return error.message || 'Unable to load your dashboard.'
  }
  return 'Unable to load your dashboard.'
}

export function UserDashboardPage(): ReactElement {
  const navigate = useNavigate()
  const { userId, logout } = useAuth()

  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const loadDashboard = useCallback(async (): Promise<void> => {
    if (userId === null) {
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const [profile, transactions] = await Promise.all([
        getUserById(userId),
        getUserTransactions(userId),
      ])

      const metrics = buildDashboardMetrics(profile, transactions)
      setData({
        profile,
        metrics,
        recent: takeRecentTransactions(transactions, RECENT_LIMIT),
        hasTransactions: transactions.length > 0,
      })
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        logout()
        void navigate('/login', { replace: true })
        return
      }
      setData(null)
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
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
        <p className="user-dashboard__loading">Loading your dashboard…</p>
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

  const { profile, metrics, recent, hasTransactions } = data

  return (
    <div className="user-dashboard">
      <header className="user-dashboard__welcome">
        <p className="user-dashboard__eyebrow">Customer dashboard</p>
        <h1 className="user-dashboard__title">Welcome, {profile.user_name}</h1>
        <p className="user-dashboard__subtitle">
          Account overview based on your PayLater profile and ledger.
        </p>
      </header>

      <section aria-label="Account summary" className="user-dashboard__cards">
        <article className="user-dashboard__card">
          <p className="user-dashboard__card-label">Credit Limit</p>
          <p className="user-dashboard__card-value">
            {formatMoneyDisplay(metrics.creditLimit)}
          </p>
        </article>
        <article className="user-dashboard__card">
          <p className="user-dashboard__card-label">Current Due</p>
          <p className="user-dashboard__card-value">
            {formatMoneyDisplay(metrics.currentDue)}
          </p>
        </article>
        <article className="user-dashboard__card">
          <p className="user-dashboard__card-label">Available Credit</p>
          <p className="user-dashboard__card-value">
            {formatMoneyDisplay(metrics.availableCredit)}
          </p>
        </article>
      </section>

      <section className="user-dashboard__section" aria-label="Activity summary">
        <h2 className="user-dashboard__section-title">Activity</h2>
        <div className="user-dashboard__activity">
          <div className="user-dashboard__activity-item">
            <p className="user-dashboard__activity-label">Purchase count</p>
            <p className="user-dashboard__activity-value">{metrics.purchaseCount}</p>
          </div>
          <div className="user-dashboard__activity-item">
            <p className="user-dashboard__activity-label">Total purchases</p>
            <p className="user-dashboard__activity-value">
              {formatMoneyDisplay(metrics.purchaseTotal)}
            </p>
          </div>
          <div className="user-dashboard__activity-item">
            <p className="user-dashboard__activity-label">Payback count</p>
            <p className="user-dashboard__activity-value">{metrics.paybackCount}</p>
          </div>
          <div className="user-dashboard__activity-item">
            <p className="user-dashboard__activity-label">Total paid</p>
            <p className="user-dashboard__activity-value">
              {formatMoneyDisplay(metrics.paybackTotal)}
            </p>
          </div>
        </div>
      </section>

      <section className="user-dashboard__section" aria-label="Recent transactions">
        <h2 className="user-dashboard__section-title">Recent transactions</h2>
        {!hasTransactions ? (
          <p className="user-dashboard__empty">
            No transactions yet. Purchases and paybacks will appear here.
          </p>
        ) : (
          <>
            <div className="user-dashboard__table-wrap admin-users__table-desktop">
              <table className="user-dashboard__table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Type</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Commission</th>
                  <th scope="col">Commission %</th>
                  <th scope="col">Merchant</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.id}</td>
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
                    <td>
                      {tx.merchant_id.Valid ? tx.merchant_id.Int32 : '—'}
                    </td>
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
                      <span className="admin-users__card-label">Amount</span>
                      <span className="admin-users__card-value">{formatMoneyDisplay(tx.amount)}</span>
                    </div>
                    <div className="admin-users__card-row">
                      <span className="admin-users__card-label">Commission</span>
                      <span className="admin-users__card-value">{formatMoneyDisplay(tx.commission)}</span>
                    </div>
                    <div className="admin-users__card-row">
                      <span className="admin-users__card-label">Merchant</span>
                      <span className="admin-users__card-value">
                        {tx.merchant_id.Valid ? tx.merchant_id.Int32 : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="user-dashboard__section" aria-label="Upcoming actions">
        <h2 className="user-dashboard__section-title">Quick actions</h2>
        <div className="user-dashboard__actions">
          <Link
            className="user-dashboard__action user-dashboard__action--enabled"
            to="/user/transactions"
          >
            View Transactions
          </Link>
          <Link
            className="user-dashboard__action user-dashboard__action--enabled"
            to="/user/purchase"
          >
            Make Purchase
          </Link>
          <Link
            className="user-dashboard__action user-dashboard__action--enabled"
            to="/user/payback"
          >
            Pay Back
          </Link>
          <Link
            className="user-dashboard__action user-dashboard__action--enabled"
            to="/user/profile"
          >
            Edit Profile
          </Link>
        </div>
      </section>
    </div>
  )
}
