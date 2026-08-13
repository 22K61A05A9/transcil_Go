/**
 * Backend DTOs for the User area.
 * Shapes match Gateway JSON from User and Transaction services.
 * Monetary fields stay strings — do not coerce to number in the API layer.
 */

/** Go sql.NullInt32 JSON encoding used by Transaction service. */
export type SqlNullInt32 = {
  Int32: number
  Valid: boolean
}

/** GET /users/:id — email and password are never returned. */
export type UserProfile = {
  id: number
  user_name: string
  credit_limit: string
  current_due: string
}

export type TransactionType = 'PURCHASE' | 'PAYBACK'

/** GET /transactions/user/:user_id — one ledger row. */
export type UserTransaction = {
  id: number
  user_id: number
  merchant_id: SqlNullInt32
  transaction_type: TransactionType
  amount: string
  commission: string
  commission_percentage: string
}

/** PUT /users/:id — only user_name is updatable. */
export type UpdateUserNameRequest = {
  user_name: string
}

/** POST /transactions — user id comes from the JWT, not the body. */
export type CreatePurchaseRequest = {
  merchant_id: number
  amount: string
}

/** GET /merchants/available — public catalog projection for purchase UI. */
export type AvailableMerchant = {
  id: number
  merchant_name: string
}

/** POST /payback — user id comes from the JWT, not the body. */
export type CreatePaybackRequest = {
  amount: string
}

/** Shared success envelope for create/update message responses. */
export type MessageResponse = {
  message: string
}
