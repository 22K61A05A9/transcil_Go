import { isApiError } from '@/shared/api/errors'

/** Maps API failures to user-facing page-load messages. */
export function mapApiErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    if (error.status === 0) {
      return 'Unable to reach the server. Check your connection and try again.'
    }
    if (error.status >= 500) {
      return 'Something went wrong on our side. Please try again.'
    }
    return error.message || fallback
  }
  return fallback
}
