import { env } from '@/shared/config/env'
import { getToken } from '@/shared/auth/tokenStorage'
import { ApiError, messageFromErrorBody } from '@/shared/api/errors'
import { joinApiUrl } from '@/shared/api/url'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type ApiRequestOptions = {
  method?: HttpMethod
  /** JSON-serializable body. Omit for requests with no body. */
  body?: unknown
  /** Override the stored token. Pass null to force an unauthenticated request. */
  token?: string | null
  headers?: Record<string, string>
  signal?: AbortSignal
}

export { joinApiUrl }

function buildUrl(path: string): string {
  return joinApiUrl(env.apiBaseUrl, path)
}

function buildHeaders(options: ApiRequestOptions): Headers {
  const headers = new Headers(options.headers)

  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = options.token === undefined ? getToken() : options.token

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return headers
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text()

  if (text.trim() === '') {
    return undefined
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new ApiError(
      response.ok ? 'Received an invalid JSON response' : text || 'Request failed',
      response.status,
    )
  }
}

/**
 * Generic JSON HTTP client for the API Gateway (via Vite `/api` proxy in development).
 * Feature modules should call this — not presentational components.
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const method = options.method ?? 'GET'
  const headers = buildHeaders(options)

  const init: RequestInit = {
    method,
    headers,
  }

  if (options.body !== undefined) {
    init.body = JSON.stringify(options.body)
  }

  if (options.signal) {
    init.signal = options.signal
  }

  let response: Response
  try {
    response = await fetch(buildUrl(path), init)
  } catch {
    throw new ApiError('Unable to reach the server', 0)
  }

  const data = await parseResponseBody(response)

  if (!response.ok) {
    throw new ApiError(
      messageFromErrorBody(data, 'Request failed'),
      response.status,
    )
  }

  return data as T
}

export function apiGet<T>(
  path: string,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {},
): Promise<T> {
  return apiRequest<T>(path, { ...options, method: 'GET' })
}

export function apiPost<T>(
  path: string,
  body?: unknown,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {},
): Promise<T> {
  return apiRequest<T>(path, {
    ...options,
    method: 'POST',
    ...(body !== undefined ? { body } : {}),
  })
}

export function apiPut<T>(
  path: string,
  body?: unknown,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {},
): Promise<T> {
  return apiRequest<T>(path, {
    ...options,
    method: 'PUT',
    ...(body !== undefined ? { body } : {}),
  })
}

export function apiPatch<T>(
  path: string,
  body?: unknown,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {},
): Promise<T> {
  return apiRequest<T>(path, {
    ...options,
    method: 'PATCH',
    ...(body !== undefined ? { body } : {}),
  })
}

export function apiDelete<T>(
  path: string,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {},
): Promise<T> {
  return apiRequest<T>(path, { ...options, method: 'DELETE' })
}

/** Builds the request URL using the configured `VITE_API_BASE_URL`. */
export function resolveApiUrl(path: string): string {
  return buildUrl(path)
}
