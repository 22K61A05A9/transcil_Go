import { isApiError } from '@/shared/api/errors'

/**
 * Map user registration failures to concise, user-facing copy.
 */
export function getUserRegisterErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    const backendMessage = error.message.toLowerCase()

    switch (error.status) {
      case 0:
        return 'Unable to reach the server. Check your connection and try again.'
      case 400:
        if (
          backendMessage.includes('email already') ||
          backendMessage.includes('duplicate') ||
          backendMessage.includes('unique')
        ) {
          return 'An account with this email may already be registered. Try signing in instead.'
        }
        return 'Please check your details and try again.'
      case 404:
        return 'The registration service could not be found.'
      case 500:
      case 502:
      case 503:
        if (
          backendMessage.includes('duplicate') ||
          backendMessage.includes('unique') ||
          backendMessage.includes('email')
        ) {
          return 'An account with this email may already be registered. Try signing in instead.'
        }
        return 'Something went wrong on our side. Please try again later.'
      default:
        return 'Unable to create your account. Please try again.'
    }
  }

  return 'Unable to create your account. Please try again.'
}
