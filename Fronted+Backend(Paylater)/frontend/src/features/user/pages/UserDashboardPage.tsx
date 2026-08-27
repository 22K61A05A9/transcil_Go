import {
  useCallback,
  useEffect,
  useState,
  type ReactElement,
} from 'react'
import { Link } from 'react-router-dom'

import { getUserById, getUserTransactions } from '@/features/user/api/userApi'
import {
  buildDashboardMetrics,
  takeRecentTransactions,
  type UserDashboardMetrics,
} from '@/features/user/lib/dashboardMetrics'
import { moneyToCents } from '@/shared/lib/money'
import type { UserProfile, UserTransaction } from '@/features/user/types'
import { isApiError } from '@/shared/api/errors'
import { mapApiErrorMessage } from '@/shared/lib/apiErrorMessage'
import { useAuth } from '@/shared/auth/useAuth'
import { CurrencyAmount } from '@/shared/ui/CurrencyAmount'
import { PageLoadError } from '@/shared/ui/PageLoadError'
import { PageLoadingState } from '@/shared/ui/PageLoadingState'
import '@/shared/styles/page-shell.css'
import '@/features/user/styles/user-dashboard.css'

const RECENT_LIMIT = 5

type DashboardData = {
  profile: UserProfile
  metrics: UserDashboardMetrics
  recent: UserTransaction[]
  hasTransactions: boolean
}

function hasOutstandingDue(currentDue: string): boolean {
  try {
    return moneyToCents(currentDue) > 0n
  } catch {
    return false
  }
}

function UserDashboardSkeleton(): ReactElement {
  return (
    <div
      className="user-dashboard pl-page user-dashboard--loading"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading your dashboard"
    >
      <div className="user-dashboard__skeleton user-dashboard__skeleton--hero" />
      <div className="user-dashboard__skeleton-grid" aria-hidden="true">
        <div className="user-dashboard__skeleton user-dashboard__skeleton--card" />
        <div className="user-dashboard__skeleton user-dashboard__skeleton--card" />
        <div className="user-dashboard__skeleton user-dashboard__skeleton--card" />
      </div>
      <div className="user-dashboard__skeleton-grid" aria-hidden="true">
        <div className="user-dashboard__skeleton user-dashboard__skeleton--card" />
        <div className="user-dashboard__skeleton user-dashboard__skeleton--card" />
        <div className="user-dashboard__skeleton user-dashboard__skeleton--card" />
        <div className="user-dashboard__skeleton user-dashboard__skeleton--card" />
      </div>
      <div className="user-dashboard__skeleton-layout" aria-hidden="true">
        <div className="user-dashboard__skeleton user-dashboard__skeleton--section" />
        <div className="user-dashboard__skeleton user-dashboard__skeleton--section" />
      </div>
    </div>
  )
}

function RecentTransactionRow({ tx }: { tx: UserTransaction }): ReactElement {
  return (
    <tr>
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
      <td className="user-dashboard__amount-cell">
        <CurrencyAmount value={tx.amount} />
      </td>
      <td>
        <CurrencyAmount value={tx.commission} />
      </td>
      <td>{tx.commission_percentage}%</td>
      <td>{tx.merchant_id.Valid ? tx.merchant_id.Int32 : '—'}</td>
    </tr>
  )
}

function RecentTransactionCard({ tx }: { tx: UserTransaction }): ReactElement {
  return (
    <article className="user-dashboard__tx-card">
      <div className="user-dashboard__tx-card-header">
        <span
          className={
            tx.transaction_type === 'PURCHASE'
              ? 'user-dashboard__type user-dashboard__type--purchase'
              : 'user-dashboard__type user-dashboard__type--payback'
          }
        >
          {tx.transaction_type}
        </span>
        <span className="user-dashboard__tx-card-id">ID {tx.id}</span>
      </div>
      <div className="user-dashboard__tx-card-body">
        <div className="user-dashboard__tx-card-row">
          <span className="user-dashboard__tx-card-label">Amount</span>
          <span className="user-dashboard__tx-card-value">
            <CurrencyAmount value={tx.amount} />
          </span>
        </div>
        <div className="user-dashboard__tx-card-row">
          <span className="user-dashboard__tx-card-label">Commission</span>
          <span className="user-dashboard__tx-card-value">
            <CurrencyAmount value={tx.commission} />
          </span>
        </div>
        <div className="user-dashboard__tx-card-row">
          <span className="user-dashboard__tx-card-label">Merchant</span>
          <span className="user-dashboard__tx-card-value">
            {tx.merchant_id.Valid ? tx.merchant_id.Int32 : '—'}
          </span>
        </div>
      </div>
    </article>
  )
}

export function UserDashboardPage(): ReactElement {
  const { userId } = useAuth()

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
        return
      }
      setData(null)
      setErrorMessage(mapApiErrorMessage(error, 'Unable to load your dashboard.'))
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard, reloadKey])

  if (userId === null) {
    return <PageLoadingState message="Sign in required." />
  }

  if (isLoading && data === null) {
    return <UserDashboardSkeleton />
  }

  if (errorMessage !== null && data === null) {
    return (
      <div className="user-dashboard pl-page">
        <div className="user-dashboard__error-wrap">
          <PageLoadError
            title="Unable to load dashboard"
            message={errorMessage}
            onRetry={() => {
              setReloadKey((key) => key + 1)
            }}
          />
        </div>
      </div>
    )
  }

  if (data === null) {
    return (
      <div className="user-dashboard pl-page">
        <div className="user-dashboard__empty-state" role="status">
          <span className="user-dashboard__empty-icon" aria-hidden="true">
            —
          </span>
          <p className="user-dashboard__empty-title">No dashboard data available</p>
          <p className="user-dashboard__empty">
            We could not show your account overview right now.
          </p>
        </div>
      </div>
    )
  }

  const { profile, metrics, recent, hasTransactions } = data
  const dueOutstanding = hasOutstandingDue(metrics.currentDue)

  return (
    <div className="user-dashboard pl-page">
      <header className="user-dashboard__hero">
        <div className="user-dashboard__hero-content">
          <p className="user-dashboard__eyebrow">Customer dashboard</p>
          <h1 className="user-dashboard__title">Welcome back, {profile.user_name}</h1>
          <p className="user-dashboard__subtitle">
            Your PayLater account at a glance — credit, balance, and recent activity.
          </p>
        </div>
        <span className="user-dashboard__account-pill">Account #{profile.id}</span>
      </header>

      <section aria-label="Account summary" className="user-dashboard__summary">
        <article className="user-dashboard__card user-dashboard__card--featured">
          <p className="user-dashboard__card-label">Available credit</p>
          <p className="user-dashboard__card-value">
            <CurrencyAmount value={metrics.availableCredit} />
          </p>
          <p className="user-dashboard__card-hint">Ready to use for purchases</p>
        </article>
        <article
          className={
            dueOutstanding
              ? 'user-dashboard__card user-dashboard__card--due'
              : 'user-dashboard__card'
          }
        >
          <p className="user-dashboard__card-label">Current due</p>
          <p className="user-dashboard__card-value">
            <CurrencyAmount value={metrics.currentDue} />
          </p>
          <p className="user-dashboard__card-hint">
            {dueOutstanding ? 'Outstanding balance to repay' : 'No outstanding balance'}
          </p>
        </article>
        <article className="user-dashboard__card">
          <p className="user-dashboard__card-label">Credit limit</p>
          <p className="user-dashboard__card-value">
            <CurrencyAmount value={metrics.creditLimit} />
          </p>
          <p className="user-dashboard__card-hint">Maximum PayLater spending power</p>
        </article>
      </section>

      <section aria-label="Quick actions">
        <h2 className="user-dashboard__section-title">Quick actions</h2>
        <div className="user-dashboard__quick-actions">
          <Link
            className="user-dashboard__quick-action user-dashboard__quick-action--primary"
            to="/user/purchase"
          >
            <span className="user-dashboard__quick-action-label">Make purchase</span>
            <span className="user-dashboard__quick-action-hint">Buy now, pay later</span>
          </Link>
          <Link
            className="user-dashboard__quick-action user-dashboard__quick-action--primary"
            to="/user/payback"
          >
            <span className="user-dashboard__quick-action-label">Pay back</span>
            <span className="user-dashboard__quick-action-hint">Reduce your current due</span>
          </Link>
          <Link className="user-dashboard__quick-action" to="/user/transactions">
            <span className="user-dashboard__quick-action-label">View transactions</span>
            <span className="user-dashboard__quick-action-hint">Full ledger history</span>
          </Link>
          <Link className="user-dashboard__quick-action" to="/user/profile">
            <span className="user-dashboard__quick-action-label">Edit profile</span>
            <span className="user-dashboard__quick-action-hint">Update your details</span>
          </Link>
        </div>
      </section>

      <div className="user-dashboard__layout-split">
        <section className="user-dashboard__section" aria-labelledby="user-activity-heading">
          <h2 id="user-activity-heading" className="user-dashboard__section-title">
            Activity summary
          </h2>
          <div className="user-dashboard__activity">
            <div className="user-dashboard__activity-item">
              <p className="user-dashboard__activity-label">Purchases</p>
              <p className="user-dashboard__activity-value">{metrics.purchaseCount}</p>
            </div>
            <div className="user-dashboard__activity-item">
              <p className="user-dashboard__activity-label">Total purchased</p>
              <p className="user-dashboard__activity-value">
                <CurrencyAmount value={metrics.purchaseTotal} />
              </p>
            </div>
            <div className="user-dashboard__activity-item">
              <p className="user-dashboard__activity-label">Paybacks</p>
              <p className="user-dashboard__activity-value">{metrics.paybackCount}</p>
            </div>
            <div className="user-dashboard__activity-item">
              <p className="user-dashboard__activity-label">Total repaid</p>
              <p className="user-dashboard__activity-value">
                <CurrencyAmount value={metrics.paybackTotal} />
              </p>
            </div>
          </div>
        </section>

        <section className="user-dashboard__section" aria-labelledby="user-recent-heading">
          <div className="user-dashboard__section-header">
            <h2 id="user-recent-heading" className="user-dashboard__section-title">
              Recent transactions
            </h2>
            {hasTransactions ? (
              <Link className="user-dashboard__section-link" to="/user/transactions">
                View all
              </Link>
            ) : null}
          </div>
          {!hasTransactions ? (
            <div className="user-dashboard__empty-state">
              <span className="user-dashboard__empty-icon" aria-hidden="true">
                ∅
              </span>
              <p className="user-dashboard__empty-title">No transactions yet</p>
              <p className="user-dashboard__empty">
                Purchases and paybacks will appear here once you start using PayLater.
              </p>
              <Link
                className="user-dashboard__quick-action user-dashboard__quick-action--primary user-dashboard__empty-action"
                to="/user/purchase"
              >
                <span className="user-dashboard__quick-action-label">Make your first purchase</span>
              </Link>
            </div>
          ) : (
            <>
              <div className="user-dashboard__table-wrap user-dashboard__tx-table-desktop">
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
                      <RecentTransactionRow key={tx.id} tx={tx} />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="user-dashboard__tx-cards">
                {recent.map((tx) => (
                  <RecentTransactionCard key={tx.id} tx={tx} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
