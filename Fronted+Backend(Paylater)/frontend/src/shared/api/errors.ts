/**
 * Normalized API failure used across the frontend.
 * UI layers decide how (or whether) to show `message` to users.
 */
export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError
}

type BackendErrorBody = {
  error?: unknown
}

export function messageFromErrorBody(data: unknown, fallback: string): string {
  if (typeof data !== 'object' || data === null) {
    return fallback
  }

  const errorValue = (data as BackendErrorBody).error
  if (typeof errorValue === 'string' && errorValue.trim() !== '') {
    return errorValue
  }

  return fallback
}
