import axios from 'axios'

import { getToken } from '@/shared/auth/tokenStorage'
import { ApiError, messageFromErrorBody } from '@/shared/api/errors'
import { axiosInstance } from '@/shared/api/axiosInstance'
import { notifyUnauthorizedSession } from '@/shared/api/unauthorizedSession'
import { joinApiUrl } from '@/shared/api/url'
import { env } from '@/shared/config/env'

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

function resolveRequestToken(options: ApiRequestOptions): string | null {
  if (options.token === undefined) {
    return getToken()
  }
  return options.token
}

function buildHeaders(
  options: ApiRequestOptions,
  requestToken: string | null,
): Record<string, string> {
  const headers: Record<string, string> = { ...options.headers }

  if (options.body !== undefined && headers['Content-Type'] === undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (requestToken) {
    headers.Authorization = `Bearer ${requestToken}`
  }

  return headers
}

function normalizePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}

function parseResponseBody(status: number, text: string): unknown {
  if (text.trim() === '') {
    return undefined
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new ApiError(
      status >= 200 && status < 300 ? 'Received an invalid JSON response' : text || 'Request failed',
      status,
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
  const requestToken = resolveRequestToken(options)
  const sentAuthorization = requestToken !== null && requestToken.trim() !== ''
  const headers = buildHeaders(options, requestToken)

  let response
  try {
    response = await axiosInstance.request<string>({
      url: normalizePath(path),
      method,
      headers,
      ...(options.body !== undefined ? { data: options.body } : {}),
      ...(options.signal ? { signal: options.signal } : {}),
      responseType: 'text',
    })
  } catch (error) {
    if (axios.isCancel(error)) {
      throw error
    }

    throw new ApiError('Unable to reach the server', 0)
  }

  const data = parseResponseBody(response.status, response.data ?? '')

  if (response.status < 200 || response.status >= 300) {
    if (response.status === 401 && sentAuthorization) {
      notifyUnauthorizedSession()
    }

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
