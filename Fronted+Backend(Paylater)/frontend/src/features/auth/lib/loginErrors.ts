import { isApiError } from '@/shared/api/errors'

/**
 * Map login failures to concise, user-facing copy.
 * Prefer HTTP status over raw backend strings.
 */
export function getLoginErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    switch (error.status) {
      case 0:
        return 'Unable to reach the server. Check your connection and try again.'
      case 400:
        return 'Please check your email and password and try again.'
      case 401:
        return 'Invalid email or password.'
      case 403:
        return 'You do not have permission to sign in.'
      case 404:
        return 'The sign-in service could not be found.'
      case 500:
      case 502:
      case 503:
        return 'Something went wrong on our side. Please try again later.'
      default:
        return 'Unable to sign in. Please try again.'
    }
  }

  return 'Unable to sign in. Please try again.'
}
