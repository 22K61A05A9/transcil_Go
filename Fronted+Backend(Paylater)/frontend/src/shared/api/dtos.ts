/**
 * Shared backend DTO shapes used across multiple feature areas.
 * Monetary fields stay strings — do not coerce to number in the API layer.
 */

/** Go sql.NullInt32 JSON encoding used by Transaction service. */
export type SqlNullInt32 = {
  Int32: number
  Valid: boolean
}

/** Shared success envelope for create/update/delete message responses. */
export type MessageResponse = {
  message: string
}
