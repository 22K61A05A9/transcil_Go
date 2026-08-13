/**
 * Backend DTOs for the Admin area.
 * Shapes match Gateway JSON from Admin, User, Merchant, Transaction, and Report services.
 * Monetary fields stay strings — do not coerce to number in the API layer.
 */

/** Go sql.NullInt32 JSON encoding used by Transaction service. */
export type SqlNullInt32 = {
  Int32: number
  Valid: boolean
}

export type AdminRole = 'ADMIN' | 'SUPER_ADMIN'

export type AdminTransactionType = 'PURCHASE' | 'PAYBACK'

/** Shared success envelope for create/update/delete message responses. */
export type MessageResponse = {
  message: string
}

/** GET /admins, GET /admins/:id — password is never returned. */
export type AdminProfile = {
  id: number
  admin_name: string
  email: string
  role: AdminRole
}

/** POST /admins — SUPER_ADMIN only (enforced by backend). */
export type CreateAdminRequest = {
  admin_name: string
  email: string
  password: string
  role: AdminRole
}

/** GET /users, GET /users/:id — email and password are never returned. */
export type AdminUser = {
  id: number
  user_name: string
  credit_limit: string
  current_due: string
}

/** PUT /users/:id — only user_name is updatable. */
export type UpdateAdminUserRequest = {
  user_name: string
}

/** GET /merchants, GET /merchants/:id — password is never returned. */
export type AdminMerchant = {
  id: number
  merchant_name: string
  email: string
  phone_number: string
  commission_percentage: string
}

/** POST /merchants — admin-protected merchant creation. */
export type CreateAdminMerchantRequest = {
  merchant_name: string
  email: string
  password: string
  phone_number?: string
  commission_percentage: string
}

/** PUT /merchants/:id */
export type UpdateAdminMerchantRequest = {
  merchant_name: string
  phone_number?: string
}

/** PATCH /merchants/:id/commission */
export type UpdateMerchantCommissionRequest = {
  commission_percentage: string
}

/** GET /transactions* — one ledger row from Transaction service. */
export type AdminTransaction = {
  id: number
  user_id: number
  merchant_id: SqlNullInt32
  transaction_type: AdminTransactionType
  amount: string
  commission: string
  commission_percentage: string
}

/** GET /users/credit-limit, GET /customers-with-due — report user projection. */
export type ReportUserRow = {
  id: number
  user_name: string
  credit_limit: string
  current_due: string
}

/** GET /total-due */
export type TotalDueResponse = {
  total_due: string
}

/** GET /merchant/:merchant_id/fee */
export type MerchantFeeResponse = {
  total_fee: string
}

/** GET /user/:user_id/due */
export type UserDueResponse = {
  current_due: string
}
