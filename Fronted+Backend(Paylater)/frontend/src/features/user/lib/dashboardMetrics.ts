import { addMoney, subtractMoney } from '@/features/user/lib/money'
import type { UserProfile, UserTransaction } from '@/features/user/types'

export type UserDashboardMetrics = {
  creditLimit: string
  currentDue: string
  availableCredit: string
  purchaseCount: number
  purchaseTotal: string
  paybackCount: number
  paybackTotal: string
}

export function buildDashboardMetrics(
  profile: UserProfile,
  transactions: readonly UserTransaction[],
): UserDashboardMetrics {
  let purchaseCount = 0
  let paybackCount = 0
  let purchaseTotal = '0.00'
  let paybackTotal = '0.00'

  for (const tx of transactions) {
    if (tx.transaction_type === 'PURCHASE') {
      purchaseCount += 1
      purchaseTotal = addMoney(purchaseTotal, tx.amount)
    } else if (tx.transaction_type === 'PAYBACK') {
      paybackCount += 1
      paybackTotal = addMoney(paybackTotal, tx.amount)
    }
  }

  return {
    creditLimit: profile.credit_limit,
    currentDue: profile.current_due,
    availableCredit: subtractMoney(profile.credit_limit, profile.current_due),
    purchaseCount,
    purchaseTotal,
    paybackCount,
    paybackTotal,
  }
}

/** Newest first by transaction id (backend has no timestamps / ORDER BY). */
export function sortTransactionsByIdDesc(
  transactions: readonly UserTransaction[],
): UserTransaction[] {
  return [...transactions].sort((a, b) => b.id - a.id)
}

export function takeRecentTransactions(
  transactions: readonly UserTransaction[],
  limit: number,
): UserTransaction[] {
  return sortTransactionsByIdDesc(transactions).slice(0, limit)
}
