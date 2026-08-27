import { isApiError } from '@/shared/api/errors'

/** Maps admin API failures to user-facing messages and optional 403 handling. */
export function mapAdminApiError(
  error: unknown,
  fallback: string,
  onForbidden?: () => void,
): string {
  if (isApiError(error)) {
    if (error.status === 403) {
      onForbidden?.()
      return 'Access denied. You do not have permissions for this resource.'
    }
    if (error.status === 0) {
      return 'Unable to reach the server. Check your connection.'
    }
    return error.message || fallback
  }
  return fallback
}

export function createAdminApiErrorHandler(
  setIsForbidden: (value: boolean) => void,
): (error: unknown, fallback: string) => string {
  return (error, fallback) =>
    mapAdminApiError(error, fallback, () => setIsForbidden(true))
}
