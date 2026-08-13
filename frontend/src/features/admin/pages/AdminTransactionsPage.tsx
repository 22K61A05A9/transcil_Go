import {
  useCallback,
  useEffect,
  useState,
  type ReactElement,
  type ChangeEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'

import {
  getAdminTransactions,
  getAdminTransactionById,
} from '@/features/admin/api/adminApi'
import type { AdminTransaction } from '@/features/admin/types'
import { formatMoneyDisplay } from '@/features/user/lib/money'
import { isApiError } from '@/shared/api/errors'
import { useAuth } from '@/shared/auth/useAuth'
import { showToast } from '@/shared/ui/toastState'
import '@/features/user/styles/user-dashboard.css'
import '@/features/admin/styles/admin-dashboard.css'

type FilterType = 'ALL' | 'PURCHASE' | 'PAYBACK'

export function AdminTransactionsPage(): ReactElement {
  const navigate = useNavigate()
  const { logout } = useAuth()

  // Data states
  const [transactions, setTransactions] = useState<AdminTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fatalError, setFatalError] = useState<string | null>(null)
  const [isForbidden, setIsForbidden] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  // Filters
  const [typeFilter, setTypeFilter] = useState<FilterType>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Detail Modal state
  const [viewTx, setViewTx] = useState<AdminTransaction | null>(null)
  const [isViewingLoading, setIsViewingLoading] = useState(false)

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

  const loadTransactions = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setFatalError(null)
    setIsForbidden(false)

    try {
      const data = await getAdminTransactions()
      // Sort by ID descending
      const sorted = [...data].sort((a, b) => b.id - a.id)
      setTransactions(sorted)
    } catch (err) {
      const msg = handleApiError(err, 'Unable to load transactions list.')
      setFatalError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [handleApiError])

  useEffect(() => {
    void loadTransactions()
  }, [loadTransactions, reloadKey])

  // Client-side filtering
  const filteredTransactions = transactions.filter((tx) => {
    // 1. Type filter
    if (typeFilter !== 'ALL' && tx.transaction_type !== typeFilter) {
      return false
    }

    // 2. Search query filter (matches ID, User ID, Merchant ID)
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true

    const merchantIdStr = tx.merchant_id.Valid ? tx.merchant_id.Int32.toString() : ''
    return (
      tx.id.toString().includes(q) ||
      tx.user_id.toString().includes(q) ||
      merchantIdStr.includes(q)
    )
  })

  // View details
  const handleOpenView = async (id: number): Promise<void> => {
    setIsViewingLoading(true)
    try {
      const details = await getAdminTransactionById(id)
      setViewTx(details)
    } catch (err) {
      const msg = handleApiError(err, 'Unable to fetch transaction details.')
      showToast(msg, 'error')
    } finally {
      setIsViewingLoading(false)
    }
  }

  if (isLoading && transactions.length === 0 && fatalError === null) {
    return (
      <div className="user-dashboard__status" role="status" aria-live="polite">
        <p className="user-dashboard__loading">Loading ledger transactions…</p>
      </div>
    )
  }

  if (fatalError !== null && transactions.length === 0) {
    return (
      <div className="user-dashboard__error" role="alert">
        <h1 className="user-dashboard__error-title">
          {isForbidden ? 'Access denied' : 'Unable to load transactions'}
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
    <div className="admin-dashboard user-dashboard">
      <header className="user-dashboard__welcome">
        <p className="user-dashboard__eyebrow admin-dashboard__eyebrow">
          Administration
        </p>
        <h1 className="user-dashboard__title">Ledger Transactions</h1>
        <p className="user-dashboard__subtitle">
          Auditing and tracking all purchase and payback activities across the system.
        </p>
      </header>

      <section className="user-dashboard__section" aria-label="Transactions database">
        <div className="admin-users__search-bar" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="search"
            className="admin-users__search-input"
            placeholder="Search by Transaction ID, User ID, or Merchant ID..."
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            style={{ minWidth: '280px' }}
          />

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {(['ALL', 'PURCHASE', 'PAYBACK'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                type="button"
                className="user-dashboard__retry"
                style={{
                  padding: '0.45rem 0.85rem',
                  fontSize: 'var(--text-xs)',
                  background: typeFilter === filter ? 'var(--color-primary)' : 'var(--color-surface-muted)',
                  color: typeFilter === filter ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                  border: 'var(--border-width) solid var(--color-border)',
                }}
                onClick={() => setTypeFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <p className="user-dashboard__empty">No transactions found matching the search criteria.</p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="user-dashboard__table-wrap admin-users__table-desktop">
              <table className="user-dashboard__table">
                <thead>
                  <tr>
                    <th scope="col">Transaction ID</th>
                    <th scope="col">User ID</th>
                    <th scope="col">Merchant ID</th>
                    <th scope="col">Type</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Commission</th>
                    <th scope="col">Commission %</th>
                    <th scope="col" style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{tx.id}</td>
                      <td>{tx.user_id}</td>
                      <td>{tx.merchant_id.Valid ? tx.merchant_id.Int32 : '—'}</td>
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
                      <td style={{ fontWeight: 'var(--weight-semibold)' }}>{formatMoneyDisplay(tx.amount)}</td>
                      <td>{formatMoneyDisplay(tx.commission)}</td>
                      <td>{tx.commission_percentage}%</td>
                      <td>
                        <div className="admin-users__actions" style={{ justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="user-dashboard__retry"
                            style={{ padding: '0.35rem 0.75rem', fontSize: 'var(--text-xs)' }}
                            disabled={isViewingLoading}
                            onClick={() => void handleOpenView(tx.id)}
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Card View */}
            <div className="admin-users__mobile-cards">
              {filteredTransactions.map((tx) => (
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
                      <span className="admin-users__card-label">Merchant ID</span>
                      <span className="admin-users__card-value">{tx.merchant_id.Valid ? tx.merchant_id.Int32 : '—'}</span>
                    </div>
                    <div className="admin-users__card-row">
                      <span className="admin-users__card-label">Amount</span>
                      <span className="admin-users__card-value" style={{ fontWeight: 'var(--weight-semibold)' }}>
                        {formatMoneyDisplay(tx.amount)}
                      </span>
                    </div>
                  </div>
                  <div className="admin-users__actions" style={{ marginTop: 'var(--space-2)' }}>
                    <button
                      type="button"
                      className="user-dashboard__retry"
                      style={{ flex: 1, padding: '0.35rem', fontSize: 'var(--text-xs)' }}
                      disabled={isViewingLoading}
                      onClick={() => void handleOpenView(tx.id)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Transaction Details Modal */}
      {viewTx !== null ? (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-panel">
            <header className="admin-modal-header">
              <h2 className="admin-modal-title">Transaction Details</h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setViewTx(null)}
              >
                &times;
              </button>
            </header>
            <div className="admin-modal-body">
              <div className="admin-details-list">
                <div className="admin-details-row">
                  <span className="admin-details-label">Transaction ID</span>
                  <span className="admin-details-value">{viewTx.id}</span>
                </div>
                <div className="admin-details-row">
                  <span className="admin-details-label">User ID</span>
                  <span className="admin-details-value">{viewTx.user_id}</span>
                </div>
                <div className="admin-details-row">
                  <span className="admin-details-label">Merchant ID</span>
                  <span className="admin-details-value">
                    {viewTx.merchant_id.Valid ? viewTx.merchant_id.Int32 : '—'}
                  </span>
                </div>
                <div className="admin-details-row">
                  <span className="admin-details-label">Transaction Type</span>
                  <span className="admin-details-value">{viewTx.transaction_type}</span>
                </div>
                <div className="admin-details-row">
                  <span className="admin-details-label">Amount</span>
                  <span className="admin-details-value" style={{ fontWeight: 'var(--weight-semibold)' }}>
                    {formatMoneyDisplay(viewTx.amount)}
                  </span>
                </div>
                <div className="admin-details-row">
                  <span className="admin-details-label">Commission Fee</span>
                  <span className="admin-details-value">{formatMoneyDisplay(viewTx.commission)}</span>
                </div>
                <div className="admin-details-row">
                  <span className="admin-details-label">Commission Percentage</span>
                  <span className="admin-details-value">{viewTx.commission_percentage}%</span>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="user-dashboard__retry"
                style={{ background: 'var(--color-secondary)' }}
                onClick={() => setViewTx(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
