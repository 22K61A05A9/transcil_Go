/**
 * Backend DTOs for the Merchant area.
 * Shapes match Gateway JSON from Merchant and Transaction services.
 * Decimal fields stay strings — do not coerce to number in the API layer.
 *
 * Authenticated merchants may call:
 * - GET /merchants/:id (own id)
 * - GET /transactions/merchant/:merchant_id (own id)
 *
 * Login/register live in features/auth. Admin merchant CRUD is not included here.
 */

/** Go sql.NullInt32 JSON encoding used by Transaction service. */
export type SqlNullInt32 = {
  Int32: number
  Valid: boolean
}

/** GET /merchants/:id — password is never returned. */
export type MerchantProfile = {
  id: number
  merchant_name: string
  email: string
  phone_number: string
  commission_percentage: string
}

/** PUT /merchants/:id — merchant_name and phone_number only. */
export type UpdateMerchantProfileRequest = {
  merchant_name: string
  phone_number?: string
}

export type MerchantTransactionType = 'PURCHASE' | 'PAYBACK'

/**
 * GET /transactions/merchant/:merchant_id — one ledger row.
 * Same row shape as the Transaction service sqlc.Transaction JSON.
 */
export type MerchantTransaction = {
  id: number
  user_id: number
  merchant_id: SqlNullInt32
  transaction_type: MerchantTransactionType
  amount: string
  commission: string
  commission_percentage: string
}
