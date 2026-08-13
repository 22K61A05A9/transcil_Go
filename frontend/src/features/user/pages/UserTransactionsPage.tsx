import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from 'react'
import { useNavigate } from 'react-router-dom'

import { getUserTransactions } from '@/features/user/api/userApi'
import { sortTransactionsByIdDesc } from '@/features/user/lib/dashboardMetrics'
import { formatMoneyDisplay } from '@/features/user/lib/money'
import type { TransactionType, UserTransaction } from '@/features/user/types'
import { isApiError } from '@/shared/api/errors'
import { useAuth } from '@/shared/auth/useAuth'
import '@/features/user/styles/user-dashboard.css'
import '@/features/user/styles/user-transactions.css'

type TxFilter = 'ALL' | TransactionType

function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 0) {
      return 'Unable to reach the server. Check your connection and try again.'
    }
    if (error.status >= 500) {
      return 'Something went wrong on our side. Please try again.'
    }
    return error.message || 'Unable to load your transactions.'
  }
  return 'Unable to load your transactions.'
}

function countByType(
  transactions: readonly UserTransaction[],
  type: TransactionType,
): number {
  return transactions.reduce(
    (count, tx) => (tx.transaction_type === type ? count + 1 : count),
    0,
  )
}

export function UserTransactionsPage(): ReactElement {
  const navigate = useNavigate()
  const { userId, logout } = useAuth()

  const [transactions, setTransactions] = useState<UserTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [filter, setFilter] = useState<TxFilter>('ALL')

  const loadTransactions = useCallback(async (): Promise<void> => {
    if (userId === null) {
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const rows = await getUserTransactions(userId)
      setTransactions(sortTransactionsByIdDesc(rows))
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        logout()
        void navigate('/login', { replace: true })
        return
      }
      setTransactions([])
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [userId, logout, navigate])

  useEffect(() => {
    void loadTransactions()
  }, [loadTransactions, reloadKey])

  const purchaseCount = useMemo(
    () => countByType(transactions, 'PURCHASE'),
    [transactions],
  )
  const paybackCount = useMemo(
    () => countByType(transactions, 'PAYBACK'),
    [transactions],
  )

  const visibleTransactions = useMemo(() => {
    if (filter === 'ALL') {
      return transactions
    }
    return transactions.filter((tx) => tx.transaction_type === filter)
  }, [transactions, filter])

  if (userId === null) {
    return (
      <div className="user-dashboard__status" role="status">
        <p className="user-dashboard__loading">Sign in required.</p>
      </div>
    )
  }

  if (isLoading && transactions.length === 0 && errorMessage === null) {
    return (
      <div className="user-dashboard__status" role="status" aria-live="polite">
        <p className="user-dashboard__loading">Loading your transactions…</p>
      </div>
    )
  }

  if (errorMessage !== null && transactions.length === 0) {
    return (
      <div className="user-dashboard__error" role="alert">
        <h1 className="user-dashboard__error-title">Unable to load transactions</h1>
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

  return (
    <div className="user-transactions">
      <header className="user-dashboard__welcome">
        <p className="user-dashboard__eyebrow">Customer ledger</p>
        <h1 className="user-dashboard__title">Transactions</h1>
        <p className="user-dashboard__subtitle">
          Your purchase and payback history from the PayLater transaction service.
        </p>
      </header>

      <section className="user-dashboard__cards" aria-label="Transaction summary">
        <article className="user-dashboard__card">
          <p className="user-dashboard__card-label">Total transactions</p>
          <p className="user-dashboard__card-value">{transactions.length}</p>
        </article>
        <article className="user-dashboard__card">
          <p className="user-dashboard__card-label">Purchases</p>
          <p className="user-dashboard__card-value">{purchaseCount}</p>
        </article>
        <article className="user-dashboard__card">
          <p className="user-dashboard__card-label">Paybacks</p>
          <p className="user-dashboard__card-value">{paybackCount}</p>
        </article>
      </section>

      <section className="user-dashboard__section" aria-label="Transaction list">
        <div className="user-transactions__toolbar">
          <h2 className="user-dashboard__section-title">Ledger</h2>
          <div
            className="user-transactions__filters"
            role="group"
            aria-label="Filter by type"
          >
            {(
              [
                { id: 'ALL', label: 'All' },
                { id: 'PURCHASE', label: 'Purchases' },
                { id: 'PAYBACK', label: 'Paybacks' },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                className={
                  filter === option.id
                    ? 'user-transactions__filter user-transactions__filter--active'
                    : 'user-transactions__filter'
                }
                aria-pressed={filter === option.id}
                onClick={() => {
                  setFilter(option.id)
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {transactions.length === 0 ? (
          <p className="user-dashboard__empty">
            No transactions yet. Purchases and paybacks will appear here.
          </p>
        ) : visibleTransactions.length === 0 ? (
          <p className="user-dashboard__empty">
            No {filter === 'PURCHASE' ? 'purchases' : 'paybacks'} in your ledger.
          </p>
        ) : (
          <>
            <div className="user-dashboard__table-wrap user-transactions__table-desktop">
              <table className="user-dashboard__table">
                <thead>
                  <tr>
                    <th scope="col">Transaction ID</th>
                    <th scope="col">Type</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Commission</th>
                    <th scope="col">Commission %</th>
                    <th scope="col">Merchant ID</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTransactions.map((tx) => (
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

            <ul className="user-transactions__cards-mobile">
              {visibleTransactions.map((tx) => (
                <li key={tx.id} className="user-transactions__card">
                  <div className="user-transactions__card-row">
                    <span className="user-transactions__card-label">ID</span>
                    <span>{tx.id}</span>
                  </div>
                  <div className="user-transactions__card-row">
                    <span className="user-transactions__card-label">Type</span>
                    <span
                      className={
                        tx.transaction_type === 'PURCHASE'
                          ? 'user-dashboard__type user-dashboard__type--purchase'
                          : 'user-dashboard__type user-dashboard__type--payback'
                      }
                    >
                      {tx.transaction_type}
                    </span>
                  </div>
                  <div className="user-transactions__card-row">
                    <span className="user-transactions__card-label">Amount</span>
                    <span>{formatMoneyDisplay(tx.amount)}</span>
                  </div>
                  <div className="user-transactions__card-row">
                    <span className="user-transactions__card-label">Commission</span>
                    <span>{formatMoneyDisplay(tx.commission)}</span>
                  </div>
                  <div className="user-transactions__card-row">
                    <span className="user-transactions__card-label">Commission %</span>
                    <span>{tx.commission_percentage}</span>
                  </div>
                  <div className="user-transactions__card-row">
                    <span className="user-transactions__card-label">Merchant ID</span>
                    <span>
                      {tx.merchant_id.Valid ? tx.merchant_id.Int32 : '—'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  )
}
