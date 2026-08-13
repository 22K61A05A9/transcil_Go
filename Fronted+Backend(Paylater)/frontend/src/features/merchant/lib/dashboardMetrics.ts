import { addMoney } from '@/features/user/lib/money'
import type { MerchantTransaction } from '@/features/merchant/types'

export type MerchantDashboardMetrics = {
  totalTransactions: number
  totalPurchaseAmount: string
  totalPaybackAmount: string
  totalCommission: string
}

export function buildMerchantDashboardMetrics(
  transactions: readonly MerchantTransaction[],
): MerchantDashboardMetrics {
  let totalPurchaseAmount = '0.00'
  let totalPaybackAmount = '0.00'
  let totalCommission = '0.00'

  for (const tx of transactions) {
    totalCommission = addMoney(totalCommission, tx.commission)

    if (tx.transaction_type === 'PURCHASE') {
      totalPurchaseAmount = addMoney(totalPurchaseAmount, tx.amount)
    } else if (tx.transaction_type === 'PAYBACK') {
      totalPaybackAmount = addMoney(totalPaybackAmount, tx.amount)
    }
  }

  return {
    totalTransactions: transactions.length,
    totalPurchaseAmount,
    totalPaybackAmount,
    totalCommission,
  }
}

/** Newest first by transaction id (backend has no timestamps / ORDER BY). */
export function sortMerchantTransactionsByIdDesc(
  transactions: readonly MerchantTransaction[],
): MerchantTransaction[] {
  return [...transactions].sort((a, b) => b.id - a.id)
}

export function takeRecentMerchantTransactions(
  transactions: readonly MerchantTransaction[],
  limit: number,
): MerchantTransaction[] {
  return sortMerchantTransactionsByIdDesc(transactions).slice(0, limit)
}
