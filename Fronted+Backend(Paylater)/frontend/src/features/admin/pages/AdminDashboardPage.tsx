import {
  useCallback,
  useEffect,
  useState,
  type ReactElement,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'

import {
  getAdminById,
  getAdminTransactions,
  getCustomersWithDue,
  getTotalDue,
  getUsersAtCreditLimit,
} from '@/features/admin/api/adminApi'
import type {
  AdminProfile,
  AdminTransaction,
  ReportUserRow,
} from '@/features/admin/types'
import { formatMoneyDisplay } from '@/features/user/lib/money'
import { isApiError } from '@/shared/api/errors'
import { useAuth } from '@/shared/auth/useAuth'
import { getRoleDisplayLabel } from '@/shared/ui/layout/navConfig'
import '@/features/user/styles/user-dashboard.css'
import '@/features/admin/styles/admin-dashboard.css'

type SectionKey =
  | 'adminProfile'
  | 'totalDue'
  | 'usersAtCreditLimit'
  | 'customersWithDue'
  | 'recentTransactions'

type SectionErrors = Record<SectionKey, string | null>

type AdminDashboardData = {
  adminProfile: AdminProfile | null
  totalDue: string | null
  usersAtCreditLimit: ReportUserRow[]
  customersWithDue: ReportUserRow[]
  recentTransactions: AdminTransaction[]
  sectionErrors: SectionErrors
}

const EMPTY_ERRORS: SectionErrors = {
  adminProfile: null,
  totalDue: null,
  usersAtCreditLimit: null,
  customersWithDue: null,
  recentTransactions: null,
}

const RECENT_TX_LIMIT = 8

const QUICK_ACTIONS = [
  { label: 'Manage Users', path: '/admin/users', description: 'View and edit customers' },
  { label: 'Manage Merchants', path: '/admin/merchants', description: 'Merchant accounts & commission' },
  { label: 'View Transactions', path: '/admin/transactions', description: 'Full ledger history' },
  { label: 'Platform Reports', path: '/admin/reports', description: 'Due balances & limits' },
  { label: 'My Profile', path: '/admin/profile', description: 'Your admin account' },
] as const

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

function ReportUserCards({
  rows,
  emptyMessage,
}: {
  rows: ReportUserRow[]
  emptyMessage: string
}): ReactElement {
  if (rows.length === 0) {
    return <p className="user-dashboard__empty">{emptyMessage}</p>
  }

  return (
    <div className="admin-users__mobile-cards">
      {rows.map((row) => (
        <div key={row.id} className="admin-users__card">
          <div className="admin-users__card-header">
            <span className="admin-users__card-title">{row.user_name}</span>
            <span className="admin-users__card-id">ID: {row.id}</span>
          </div>
          <div className="admin-users__card-body">
            <div className="admin-users__card-row">
              <span className="admin-users__card-label">Credit Limit</span>
              <span className="admin-users__card-value">{formatMoneyDisplay(row.credit_limit)}</span>
            </div>
            <div className="admin-users__card-row">
              <span className="admin-users__card-label">Current Due</span>
              <span className="admin-users__card-value">{formatMoneyDisplay(row.current_due)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ReportUserTable({
  rows,
  emptyMessage,
}: {
  rows: ReportUserRow[]
  emptyMessage: string
}): ReactElement {
  if (rows.length === 0) {
    return <p className="user-dashboard__empty">{emptyMessage}</p>
  }

  return (
    <div className="user-dashboard__table-wrap admin-users__table-desktop">
      <table className="user-dashboard__table">
        <thead>
          <tr>
            <th scope="col">User ID</th>
            <th scope="col">User Name</th>
            <th scope="col">Credit Limit</th>
            <th scope="col">Current Due</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.user_name}</td>
              <td>{formatMoneyDisplay(row.credit_limit)}</td>
              <td>{formatMoneyDisplay(row.current_due)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RecentTransactionTable({
  rows,
  emptyMessage,
}: {
  rows: AdminTransaction[]
  emptyMessage: string
}): ReactElement {
  if (rows.length === 0) {
    return <p className="user-dashboard__empty">{emptyMessage}</p>
  }

  return (
    <div className="user-dashboard__table-wrap admin-users__table-desktop">
      <table className="user-dashboard__table">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Type</th>
            <th scope="col">User</th>
            <th scope="col">Merchant</th>
            <th scope="col">Amount</th>
            <th scope="col">Commission</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((tx) => (
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
              <td>{tx.user_id}</td>
              <td>{tx.merchant_id.Valid ? tx.merchant_id.Int32 : '—'}</td>
              <td>{formatMoneyDisplay(tx.amount)}</td>
              <td>{formatMoneyDisplay(tx.commission)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RecentTransactionCards({
  rows,
  emptyMessage,
}: {
  rows: AdminTransaction[]
  emptyMessage: string
}): ReactElement {
  if (rows.length === 0) {
    return <p className="user-dashboard__empty">{emptyMessage}</p>
  }

  return (
    <div className="admin-users__mobile-cards">
      {rows.map((tx) => (
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
              <span className="admin-users__card-label">User</span>
              <span className="admin-users__card-value">{tx.user_id}</span>
            </div>
            <div className="admin-users__card-row">
              <span className="admin-users__card-label">Merchant</span>
              <span className="admin-users__card-value">
                {tx.merchant_id.Valid ? tx.merchant_id.Int32 : '—'}
              </span>
            </div>
            <div className="admin-users__card-row">
              <span className="admin-users__card-label">Amount</span>
              <span className="admin-users__card-value">{formatMoneyDisplay(tx.amount)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function SectionErrorBanner({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}): ReactElement {
  return (
    <div className="admin-dashboard__section-error" role="alert">
      <p className="user-dashboard__error-message">{message}</p>
      <button type="button" className="user-dashboard__retry" onClick={onRetry}>
        Retry
      </button>
    </div>
  )
}

export function AdminDashboardPage(): ReactElement {
  const navigate = useNavigate()
  const { role, userId, logout } = useAuth()

  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fatalError, setFatalError] = useState<string | null>(null)
  const [isForbidden, setIsForbidden] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const loadDashboard = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setFatalError(null)
    setIsForbidden(false)

    const promises: [
      Promise<AdminProfile | null>,
      Promise<any>,
      Promise<ReportUserRow[]>,
      Promise<ReportUserRow[]>,
      Promise<AdminTransaction[]>,
    ] = [
      userId ? getAdminById(userId) : Promise.resolve(null),
      getTotalDue(),
      getUsersAtCreditLimit(),
      getCustomersWithDue(),
      getAdminTransactions(),
    ]

    const results = await Promise.allSettled(promises)

    const handleUnauthorized = (error: unknown): boolean => {
      if (isApiError(error) && error.status === 401) {
        logout()
        void navigate('/login', { replace: true })
        return true
      }
      return false
    }

    for (const result of results) {
      if (result.status === 'rejected' && handleUnauthorized(result.reason)) {
        return
      }
    }

    const sectionErrors: SectionErrors = { ...EMPTY_ERRORS }
    const keys: SectionKey[] = [
      'adminProfile',
      'totalDue',
      'usersAtCreditLimit',
      'customersWithDue',
      'recentTransactions',
    ]

    let forbiddenCount = 0

    results.forEach((result, index) => {
      const key = keys[index]
      if (key === undefined) {
        return
      }
      if (result.status === 'rejected') {
        if (isApiError(result.reason) && result.reason.status === 403) {
          forbiddenCount += 1
        }
        sectionErrors[key] = getErrorMessage(
          result.reason,
          `Unable to load ${key}.`,
        )
      }
    })

    const [
      adminProfileOutcome,
      totalDueOutcome,
      creditLimitOutcome,
      customersDueOutcome,
      transactionsOutcome,
    ] = results

    const successCount = results.filter((r) => r.status === 'fulfilled').length

    if (successCount === 0 && forbiddenCount === results.length) {
      setData(null)
      setIsForbidden(true)
      setFatalError('Access denied. Admin privileges are required for this dashboard.')
      setIsLoading(false)
      return
    }

    if (successCount === 0) {
      setData(null)
      setFatalError(
        sectionErrors.totalDue ??
          'Unable to load the administration dashboard.',
      )
      setIsLoading(false)
      return
    }

    setData({
      adminProfile:
        adminProfileOutcome.status === 'fulfilled'
          ? adminProfileOutcome.value
          : null,
      totalDue:
        totalDueOutcome.status === 'fulfilled'
          ? totalDueOutcome.value.total_due
          : null,
      usersAtCreditLimit:
        creditLimitOutcome.status === 'fulfilled'
          ? creditLimitOutcome.value
          : [],
      customersWithDue:
        customersDueOutcome.status === 'fulfilled'
          ? customersDueOutcome.value
          : [],
      recentTransactions:
        transactionsOutcome.status === 'fulfilled'
          ? transactionsOutcome.value.slice(0, RECENT_TX_LIMIT)
          : [],
      sectionErrors,
    })
    setIsLoading(false)
  }, [logout, navigate, userId])

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard, reloadKey])

  const roleLabel = role === null ? 'Administration' : getRoleDisplayLabel(role)

  if (isLoading && data === null && fatalError === null) {
    return (
      <div className="user-dashboard__status" role="status" aria-live="polite">
        <p className="user-dashboard__loading">Loading administration dashboard…</p>
      </div>
    )
  }

  if (fatalError !== null && data === null) {
    return (
      <div className="user-dashboard__error" role="alert">
        <h1 className="user-dashboard__error-title">
          {isForbidden ? 'Access denied' : 'Unable to load dashboard'}
        </h1>
        <p className="user-dashboard__error-message">{fatalError}</p>
        {!isForbidden ? (
          <button
            type="button"
            className="user-dashboard__retry"
            onClick={() => {
              setReloadKey((key) => key + 1)
            }}
          >
            Retry
          </button>
        ) : null}
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

  const {
    adminProfile,
    totalDue,
    usersAtCreditLimit,
    customersWithDue,
    recentTransactions,
    sectionErrors,
  } = data

  const adminName = adminProfile?.admin_name ?? 'Admin'

  return (
    <div className="admin-dashboard user-dashboard">
      <header className="user-dashboard__welcome">
        <p className="user-dashboard__eyebrow admin-dashboard__eyebrow">
          Administration
        </p>
        <h1 className="user-dashboard__title">Welcome, {adminName}</h1>
        <p className="user-dashboard__subtitle">
          Signed in as {roleLabel}. Key platform metrics, recent activity, and
          quick links to administration tools.
        </p>
      </header>

      <section
        className="user-dashboard__cards admin-dashboard__summary"
        aria-label="Platform summary"
      >
        <article className="user-dashboard__card">
          <p className="user-dashboard__card-label">Total Outstanding Due</p>
          <p className="user-dashboard__card-value">
            {sectionErrors.totalDue !== null
              ? '—'
              : totalDue === null
                ? '—'
                : formatMoneyDisplay(totalDue)}
          </p>
          {sectionErrors.totalDue !== null ? (
            <p className="admin-dashboard__card-error">{sectionErrors.totalDue}</p>
          ) : null}
        </article>
        <article className="user-dashboard__card">
          <p className="user-dashboard__card-label">Users at Credit Limit</p>
          <p className="user-dashboard__card-value">
            {sectionErrors.usersAtCreditLimit !== null
              ? '—'
              : usersAtCreditLimit.length}
          </p>
          {sectionErrors.usersAtCreditLimit !== null ? (
            <p className="admin-dashboard__card-error">{sectionErrors.usersAtCreditLimit}</p>
          ) : null}
        </article>
        <article className="user-dashboard__card">
          <p className="user-dashboard__card-label">Customers With Due</p>
          <p className="user-dashboard__card-value">
            {sectionErrors.customersWithDue !== null
              ? '—'
              : customersWithDue.length}
          </p>
          {sectionErrors.customersWithDue !== null ? (
            <p className="admin-dashboard__card-error">{sectionErrors.customersWithDue}</p>
          ) : null}
        </article>
      </section>

      <section className="user-dashboard__section" aria-label="Quick actions">
        <h2 className="user-dashboard__section-title">Quick actions</h2>
        <div className="admin-dashboard__quick-actions">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.path}
              className="admin-dashboard__quick-action"
              to={action.path}
            >
              <span className="admin-dashboard__quick-action-label">{action.label}</span>
              <span className="admin-dashboard__quick-action-desc">{action.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="user-dashboard__section" aria-label="Recent transactions">
        <div className="admin-reports__section-header">
          <h2 className="user-dashboard__section-title">Recent transactions</h2>
          <Link className="admin-reports__section-link" to="/admin/transactions">
            View all
          </Link>
        </div>
        {sectionErrors.recentTransactions !== null ? (
          <SectionErrorBanner
            message={sectionErrors.recentTransactions}
            onRetry={() => {
              setReloadKey((key) => key + 1)
            }}
          />
        ) : (
          <>
            <RecentTransactionTable
              rows={recentTransactions}
              emptyMessage="No transactions recorded yet."
            />
            <RecentTransactionCards
              rows={recentTransactions}
              emptyMessage="No transactions recorded yet."
            />
          </>
        )}
      </section>

      <section className="user-dashboard__section" aria-label="Customers with due preview">
        <div className="admin-reports__section-header">
          <h2 className="user-dashboard__section-title">Customers with due (preview)</h2>
          <Link className="admin-reports__section-link" to="/admin/reports">
            Full reports
          </Link>
        </div>
        {sectionErrors.customersWithDue !== null ? (
          <SectionErrorBanner
            message={sectionErrors.customersWithDue}
            onRetry={() => {
              setReloadKey((key) => key + 1)
            }}
          />
        ) : (
          <>
            <ReportUserTable
              rows={customersWithDue.slice(0, 5)}
              emptyMessage="No customers currently have an outstanding due balance."
            />
            <ReportUserCards
              rows={customersWithDue.slice(0, 5)}
              emptyMessage="No customers currently have an outstanding due balance."
            />
            {customersWithDue.length > 5 ? (
              <p className="user-dashboard__subtitle" style={{ marginTop: 'var(--space-2)' }}>
                Showing first 5 of {customersWithDue.length} customers with due balance.
              </p>
            ) : null}
          </>
        )}
      </section>
    </div>
  )
}
