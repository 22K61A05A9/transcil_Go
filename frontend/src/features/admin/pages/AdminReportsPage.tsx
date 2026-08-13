import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from 'react'
import { useNavigate } from 'react-router-dom'

import {
  getTotalDue,
  getCustomersWithDue,
  getUsersAtCreditLimit,
  getMerchantFeeCollected,
  getAdminUserDue,
} from '@/features/admin/api/adminApi'
import type { ReportUserRow } from '@/features/admin/types'
import { formatMoneyDisplay } from '@/features/user/lib/money'
import { isApiError } from '@/shared/api/errors'
import { useAuth } from '@/shared/auth/useAuth'
import '@/features/user/styles/user-dashboard.css'
import '@/features/admin/styles/admin-dashboard.css'
import '@/shared/styles/profile-page.css'

type SectionKey = 'totalDue' | 'customersWithDue' | 'usersAtCreditLimit'
type SectionErrors = Record<SectionKey, string | null>
type ReportTab = 'customersWithDue' | 'usersAtCreditLimit'

type ReportsData = {
  totalDue: string | null
  customersWithDue: ReportUserRow[]
  usersAtCreditLimit: ReportUserRow[]
  sectionErrors: SectionErrors
}

const EMPTY_ERRORS: SectionErrors = {
  totalDue: null,
  customersWithDue: null,
  usersAtCreditLimit: null,
}

function filterReportRows(rows: ReportUserRow[], query: string): ReportUserRow[] {
  const q = query.trim().toLowerCase()
  if (!q) {
    return rows
  }
  return rows.filter(
    (row) =>
      row.user_name.toLowerCase().includes(q) ||
      row.id.toString().includes(q) ||
      row.credit_limit.includes(q) ||
      row.current_due.includes(q),
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
      <table className="user-dashboard__table admin-reports__table">
        <thead>
          <tr>
            <th scope="col">User ID</th>
            <th scope="col">User name</th>
            <th scope="col">Credit limit</th>
            <th scope="col">Current due</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td className="admin-reports__name-cell">{row.user_name}</td>
              <td>{formatMoneyDisplay(row.credit_limit)}</td>
              <td className="admin-reports__due-cell">{formatMoneyDisplay(row.current_due)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
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
              <span className="admin-users__card-label">Credit limit</span>
              <span className="admin-users__card-value">{formatMoneyDisplay(row.credit_limit)}</span>
            </div>
            <div className="admin-users__card-row">
              <span className="admin-users__card-label">Current due</span>
              <span className="admin-users__card-value">{formatMoneyDisplay(row.current_due)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function AdminReportsPage(): ReactElement {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [data, setData] = useState<ReportsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fatalError, setFatalError] = useState<string | null>(null)
  const [isForbidden, setIsForbidden] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const [activeTab, setActiveTab] = useState<ReportTab>('customersWithDue')
  const [tableSearch, setTableSearch] = useState('')

  const [lookupMerchantId, setLookupMerchantId] = useState('')
  const [lookupResult, setLookupResult] = useState<string | null>(null)
  const [isLookupLoading, setIsLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)

  const [lookupUserId, setLookupUserId] = useState('')
  const [userDueResult, setUserDueResult] = useState<string | null>(null)
  const [isUserDueLoading, setIsUserDueLoading] = useState(false)
  const [userDueError, setUserDueError] = useState<string | null>(null)

  const handleApiError = useCallback((error: unknown, fallback: string): string => {
    if (isApiError(error)) {
      if (error.status === 401) {
        logout()
        void navigate('/login', { replace: true })
        return 'Session expired. Logging out...'
      }
      if (error.status === 403) {
        setIsForbidden(true)
        return 'Access denied. You do not have permissions for this resource.'
      }
      if (error.status === 0) {
        return 'Unable to reach the server. Check your connection.'
      }
      return error.message || fallback
    }
    return fallback
  }, [logout, navigate])

  const loadReports = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setFatalError(null)
    setIsForbidden(false)

    const results = await Promise.allSettled([
      getTotalDue(),
      getCustomersWithDue(),
      getUsersAtCreditLimit(),
    ])

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
    const keys: SectionKey[] = ['totalDue', 'customersWithDue', 'usersAtCreditLimit']
    let forbiddenCount = 0

    results.forEach((result, index) => {
      const key = keys[index]
      if (!key) return
      if (result.status === 'rejected') {
        if (isApiError(result.reason) && result.reason.status === 403) {
          forbiddenCount += 1
        }
        sectionErrors[key] = handleApiError(result.reason, `Unable to load ${key}.`)
      }
    })

    const [totalDueOutcome, customersDueOutcome, creditLimitOutcome] = results
    const successCount = results.filter((r) => r.status === 'fulfilled').length

    if (successCount === 0 && forbiddenCount === results.length) {
      setData(null)
      setIsForbidden(true)
      setFatalError('Access denied. Admin privileges are required for reports.')
      setIsLoading(false)
      return
    }

    if (successCount === 0) {
      setData(null)
      setFatalError(sectionErrors.totalDue ?? 'Unable to load platform reports.')
      setIsLoading(false)
      return
    }

    setData({
      totalDue: totalDueOutcome.status === 'fulfilled' ? totalDueOutcome.value.total_due : null,
      customersWithDue: customersDueOutcome.status === 'fulfilled' ? customersDueOutcome.value : [],
      usersAtCreditLimit: creditLimitOutcome.status === 'fulfilled' ? creditLimitOutcome.value : [],
      sectionErrors,
    })
    setIsLoading(false)
  }, [logout, navigate, handleApiError])

  useEffect(() => {
    void loadReports()
  }, [loadReports, reloadKey])

  const handleMerchantLookup = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    const idNum = parseInt(lookupMerchantId.trim(), 10)
    if (Number.isNaN(idNum) || idNum <= 0) {
      setLookupError('Please enter a valid merchant ID.')
      return
    }

    setIsLookupLoading(true)
    setLookupError(null)
    setLookupResult(null)

    try {
      const res = await getMerchantFeeCollected(idNum)
      setLookupResult(res.total_fee)
    } catch (err) {
      setLookupError(handleApiError(err, 'Unable to look up merchant fee.'))
    } finally {
      setIsLookupLoading(false)
    }
  }

  const handleUserDueLookup = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    const idNum = parseInt(lookupUserId.trim(), 10)
    if (Number.isNaN(idNum) || idNum <= 0) {
      setUserDueError('Please enter a valid user ID.')
      return
    }

    setIsUserDueLoading(true)
    setUserDueError(null)
    setUserDueResult(null)

    try {
      const res = await getAdminUserDue(idNum)
      setUserDueResult(res.current_due)
    } catch (err) {
      setUserDueError(handleApiError(err, 'Unable to look up user due balance.'))
    } finally {
      setIsUserDueLoading(false)
    }
  }

  const { totalDue, customersWithDue, usersAtCreditLimit, sectionErrors } = data ?? {
    totalDue: null,
    customersWithDue: [],
    usersAtCreditLimit: [],
    sectionErrors: EMPTY_ERRORS,
  }

  const activeRows = activeTab === 'customersWithDue' ? customersWithDue : usersAtCreditLimit
  const filteredRows = useMemo(
    () => filterReportRows(activeRows, tableSearch),
    [activeRows, tableSearch],
  )

  const activeTabError =
    activeTab === 'customersWithDue'
      ? sectionErrors.customersWithDue
      : sectionErrors.usersAtCreditLimit

  if (isLoading && data === null && fatalError === null) {
    return (
      <div className="user-dashboard__status" role="status" aria-live="polite">
        <p className="user-dashboard__loading">Loading platform reports…</p>
      </div>
    )
  }

  if (fatalError !== null && data === null) {
    return (
      <div className="user-dashboard__error" role="alert">
        <h1 className="user-dashboard__error-title">
          {isForbidden ? 'Access denied' : 'Unable to load reports'}
        </h1>
        <p className="user-dashboard__error-message">{fatalError}</p>
        {!isForbidden ? (
          <button
            type="button"
            className="user-dashboard__retry"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Retry
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="admin-dashboard user-dashboard admin-reports">
      <header className="user-dashboard__welcome">
        <p className="user-dashboard__eyebrow admin-dashboard__eyebrow">
          Administration
        </p>
        <h1 className="user-dashboard__title">Platform reports</h1>
        <p className="user-dashboard__subtitle">
          Outstanding liabilities, credit utilization, and commission lookups from
          live PayLater data.
        </p>
      </header>

      <section
        className="user-dashboard__cards admin-dashboard__summary admin-reports__summary"
        aria-label="Reports summary"
      >
        <article className="user-dashboard__card admin-reports__summary-card">
          <p className="user-dashboard__card-label">Total outstanding due</p>
          <p className="user-dashboard__card-value admin-reports__summary-value">
            {sectionErrors.totalDue !== null
              ? '—'
              : totalDue === null
                ? '—'
                : formatMoneyDisplay(totalDue)}
          </p>
          {sectionErrors.totalDue !== null ? (
            <p className="admin-dashboard__card-error">{sectionErrors.totalDue}</p>
          ) : (
            <p className="admin-reports__summary-hint">Across all customers</p>
          )}
        </article>
        <article className="user-dashboard__card admin-reports__summary-card">
          <p className="user-dashboard__card-label">Customers with due</p>
          <p className="user-dashboard__card-value admin-reports__summary-value">
            {sectionErrors.customersWithDue !== null ? '—' : customersWithDue.length}
          </p>
          {sectionErrors.customersWithDue !== null ? (
            <p className="admin-dashboard__card-error">{sectionErrors.customersWithDue}</p>
          ) : (
            <p className="admin-reports__summary-hint">Active outstanding balances</p>
          )}
        </article>
        <article className="user-dashboard__card admin-reports__summary-card">
          <p className="user-dashboard__card-label">At credit limit</p>
          <p className="user-dashboard__card-value admin-reports__summary-value">
            {sectionErrors.usersAtCreditLimit !== null ? '—' : usersAtCreditLimit.length}
          </p>
          {sectionErrors.usersAtCreditLimit !== null ? (
            <p className="admin-dashboard__card-error">{sectionErrors.usersAtCreditLimit}</p>
          ) : (
            <p className="admin-reports__summary-hint">Fully utilized accounts</p>
          )}
        </article>
      </section>

      <section className="admin-reports__lookup-grid" aria-label="Lookup tools">
        <div className="profile-page__card admin-reports__lookup-card">
          <h2 className="user-dashboard__section-title">Merchant commission lookup</h2>
          <p className="admin-reports__lookup-desc">
            Total platform commission collected from a merchant.
          </p>
          <form className="admin-reports__lookup-form" onSubmit={(e) => void handleMerchantLookup(e)}>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="merchant-lookup-id">Merchant ID</label>
              <input
                type="text"
                id="merchant-lookup-id"
                className="admin-form-input"
                value={lookupMerchantId}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setLookupMerchantId(e.target.value)}
                placeholder="e.g. 15"
                required
                disabled={isLookupLoading}
              />
            </div>
            <button type="submit" className="user-dashboard__retry" disabled={isLookupLoading}>
              {isLookupLoading ? 'Loading…' : 'Look up fee'}
            </button>
          </form>
          {lookupError !== null ? (
            <p className="admin-dashboard__card-error">{lookupError}</p>
          ) : null}
          {lookupResult !== null ? (
            <div className="admin-reports__lookup-result">
              <span className="admin-reports__lookup-result-label">Total commission</span>
              <span className="admin-reports__lookup-result-value">
                {formatMoneyDisplay(lookupResult)}
              </span>
            </div>
          ) : null}
        </div>

        <div className="profile-page__card admin-reports__lookup-card">
          <h2 className="user-dashboard__section-title">User due lookup</h2>
          <p className="admin-reports__lookup-desc">
            Current outstanding balance for a specific customer.
          </p>
          <form className="admin-reports__lookup-form" onSubmit={(e) => void handleUserDueLookup(e)}>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="user-due-lookup-id">User ID</label>
              <input
                type="text"
                id="user-due-lookup-id"
                className="admin-form-input"
                value={lookupUserId}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setLookupUserId(e.target.value)}
                placeholder="e.g. 8"
                required
                disabled={isUserDueLoading}
              />
            </div>
            <button type="submit" className="user-dashboard__retry" disabled={isUserDueLoading}>
              {isUserDueLoading ? 'Loading…' : 'Look up due'}
            </button>
          </form>
          {userDueError !== null ? (
            <p className="admin-dashboard__card-error">{userDueError}</p>
          ) : null}
          {userDueResult !== null ? (
            <div className="admin-reports__lookup-result">
              <span className="admin-reports__lookup-result-label">Current due</span>
              <span className="admin-reports__lookup-result-value">
                {formatMoneyDisplay(userDueResult)}
              </span>
            </div>
          ) : null}
        </div>
      </section>

      <section className="profile-page__card admin-reports__table-section" aria-label="Report tables">
        <div className="admin-reports__tabs" role="tablist" aria-label="Report views">
          <button
            type="button"
            role="tab"
            className={
              activeTab === 'customersWithDue'
                ? 'admin-reports__tab admin-reports__tab--active'
                : 'admin-reports__tab'
            }
            aria-selected={activeTab === 'customersWithDue'}
            onClick={() => {
              setActiveTab('customersWithDue')
              setTableSearch('')
            }}
          >
            Customers with due ({customersWithDue.length})
          </button>
          <button
            type="button"
            role="tab"
            className={
              activeTab === 'usersAtCreditLimit'
                ? 'admin-reports__tab admin-reports__tab--active'
                : 'admin-reports__tab'
            }
            aria-selected={activeTab === 'usersAtCreditLimit'}
            onClick={() => {
              setActiveTab('usersAtCreditLimit')
              setTableSearch('')
            }}
          >
            At credit limit ({usersAtCreditLimit.length})
          </button>
        </div>

        <div className="admin-users__search-bar">
          <input
            type="search"
            className="admin-users__search-input"
            placeholder="Filter by name, ID, limit, or due…"
            value={tableSearch}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTableSearch(e.target.value)}
            aria-label="Filter report table"
          />
          {tableSearch.trim() !== '' ? (
            <button
              type="button"
              className="user-dashboard__retry"
              style={{ background: 'var(--color-secondary)' }}
              onClick={() => setTableSearch('')}
            >
              Clear
            </button>
          ) : null}
        </div>

        {activeTabError !== null ? (
          <p className="admin-dashboard__card-error">{activeTabError}</p>
        ) : (
          <>
            <p className="admin-reports__table-meta">
              Showing {filteredRows.length} of {activeRows.length} records
            </p>
            <ReportUserTable
              rows={filteredRows}
              emptyMessage={
                tableSearch.trim() !== ''
                  ? 'No records match your filter.'
                  : activeTab === 'customersWithDue'
                    ? 'No customers currently have outstanding balances.'
                    : 'No users are currently at their credit limit.'
              }
            />
            <ReportUserCards
              rows={filteredRows}
              emptyMessage={
                tableSearch.trim() !== ''
                  ? 'No records match your filter.'
                  : activeTab === 'customersWithDue'
                    ? 'No customers currently have outstanding balances.'
                    : 'No users are currently at their credit limit.'
              }
            />
          </>
        )}
      </section>
    </div>
  )
}
