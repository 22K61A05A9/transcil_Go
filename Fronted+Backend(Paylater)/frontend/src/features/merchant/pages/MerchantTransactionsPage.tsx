import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from 'react'

import { getMerchantTransactions } from '@/features/merchant/api/merchantApi'
import {
  buildMerchantDashboardMetrics,
  sortMerchantTransactionsByIdDesc,
} from '@/features/merchant/lib/dashboardMetrics'
import type {
  MerchantTransaction,
  MerchantTransactionType,
} from '@/features/merchant/types'
import { isApiError } from '@/shared/api/errors'
import { mapApiErrorMessage } from '@/shared/lib/apiErrorMessage'
import { useAuth } from '@/shared/auth/useAuth'
import { CurrencyAmount } from '@/shared/ui/CurrencyAmount'
import { PageLoadError } from '@/shared/ui/PageLoadError'
import { PageLoadingState } from '@/shared/ui/PageLoadingState'
import { PageSkeleton } from '@/shared/ui/PageSkeleton'
import '@/shared/styles/page-shell.css'
import '@/features/merchant/styles/merchant-transactions.css'

type TxFilter = 'ALL' | MerchantTransactionType

export function MerchantTransactionsPage(): ReactElement {
  const { userId } = useAuth()

  const [transactions, setTransactions] = useState<MerchantTransaction[]>([])
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
      const rows = await getMerchantTransactions(userId)
      setTransactions(sortMerchantTransactionsByIdDesc(rows))
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        return
      }
      setTransactions([])
      setErrorMessage(mapApiErrorMessage(error, 'Unable to load merchant transactions.'))
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void loadTransactions()
  }, [loadTransactions, reloadKey])

  const metrics = useMemo(
    () => buildMerchantDashboardMetrics(transactions),
    [transactions],
  )

  const hasAttributablePaybacks = useMemo(
    () => transactions.some((tx) => tx.transaction_type === 'PAYBACK'),
    [transactions],
  )

  const visibleTransactions = useMemo(() => {
    if (filter === 'ALL') {
      return transactions
    }
    return transactions.filter((tx) => tx.transaction_type === filter)
  }, [transactions, filter])

  if (userId === null) {
    return <PageLoadingState message="Sign in required." />
  }

  if (isLoading && transactions.length === 0 && errorMessage === null) {
    return <PageSkeleton label="Loading merchant transactions" />
  }

  if (errorMessage !== null && transactions.length === 0) {
    return (
      <PageLoadError
        title="Unable to load transactions"
        message={errorMessage}
        onRetry={() => {
          setReloadKey((key) => key + 1)
        }}
      />
    )
  }

  return (
    <div className="merchant-transactions user-transactions pl-page">
      <header className="user-dashboard__welcome">
        <p className="user-dashboard__eyebrow">Merchant ledger</p>
        <h1 className="user-dashboard__title">Transactions</h1>
        <p className="user-dashboard__subtitle">
          Purchases recorded against your merchant account from the PayLater
          transaction service.
        </p>
      </header>

      <section
        className="user-dashboard__cards merchant-transactions__summary"
        aria-label="Transaction summary"
      >
        <article className="user-dashboard__card">
          <p className="user-dashboard__card-label">Total transactions</p>
          <p className="user-dashboard__card-value">
            {metrics.totalTransactions}
          </p>
        </article>
        <article className="user-dashboard__card">
          <p className="user-dashboard__card-label">Total purchase amount</p>
          <p className="user-dashboard__card-value">
            <CurrencyAmount value={metrics.totalPurchaseAmount} />
          </p>
        </article>
        <article className="user-dashboard__card">
          <p className="user-dashboard__card-label">Total commission</p>
          <p className="user-dashboard__card-value">
            <CurrencyAmount value={metrics.totalCommission} />
          </p>
        </article>
        {hasAttributablePaybacks ? (
          <article className="user-dashboard__card">
            <p className="user-dashboard__card-label">Total payback amount</p>
            <p className="user-dashboard__card-value">
              <CurrencyAmount value={metrics.totalPaybackAmount} />
            </p>
          </article>
        ) : null}
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
          <div className="user-dashboard__empty-state" role="status">
            <span className="user-dashboard__empty-icon" aria-hidden="true">
              ∅
            </span>
            <p className="user-dashboard__empty-title">No transactions yet</p>
            <p className="user-dashboard__empty">
              Customer purchases at your store will appear here.
            </p>
          </div>
        ) : visibleTransactions.length === 0 ? (
          <div className="user-dashboard__empty-state" role="status">
            <span className="user-dashboard__empty-icon" aria-hidden="true">
              ∅
            </span>
            <p className="user-dashboard__empty-title">
              No {filter === 'PURCHASE' ? 'purchases' : 'paybacks'} found
            </p>
            <p className="user-dashboard__empty">
              Try a different filter to see more ledger entries.
            </p>
          </div>
        ) : (
          <>
            <div className="user-dashboard__table-wrap user-transactions__table-desktop">
              <table className="user-dashboard__table">
                <thead>
                  <tr>
                    <th scope="col">Transaction ID</th>
                    <th scope="col">User ID</th>
                    <th scope="col">Transaction Type</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Commission</th>
                    <th scope="col">Commission %</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTransactions.map((tx) => (
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
                      <td className="user-dashboard__amount-cell">
                        <CurrencyAmount value={tx.amount} />
                      </td>
                      <td>
                        <CurrencyAmount value={tx.commission} />
                      </td>
                      <td>{tx.commission_percentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="user-transactions__cards-mobile">
              {visibleTransactions.map((tx) => (
                <li key={tx.id} className="user-transactions__card">
                  <div className="user-transactions__card-row">
                    <span className="user-transactions__card-label">
                      Transaction ID
                    </span>
                    <span>{tx.id}</span>
                  </div>
                  <div className="user-transactions__card-row">
                    <span className="user-transactions__card-label">User ID</span>
                    <span>{tx.user_id}</span>
                  </div>
                  <div className="user-transactions__card-row">
                    <span className="user-transactions__card-label">
                      Transaction Type
                    </span>
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
                    <span>
                      <CurrencyAmount value={tx.amount} />
                    </span>
                  </div>
                  <div className="user-transactions__card-row">
                    <span className="user-transactions__card-label">
                      Commission
                    </span>
                    <span>
                      <CurrencyAmount value={tx.commission} />
                    </span>
                  </div>
                  <div className="user-transactions__card-row">
                    <span className="user-transactions__card-label">
                      Commission %
                    </span>
                    <span>{tx.commission_percentage}</span>
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
