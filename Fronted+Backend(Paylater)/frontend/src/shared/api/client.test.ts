import type { AxiosResponse } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { requestMock } = vi.hoisted(() => ({
  requestMock: vi.fn(),
}))

vi.mock('@/shared/api/axiosInstance', () => ({
  axiosInstance: {
    request: requestMock,
  },
}))

import { apiRequest } from '@/shared/api/client'
import { ApiError, isApiError } from '@/shared/api/errors'
import { setUnauthorizedSessionHandler } from '@/shared/api/unauthorizedSession'

function mockAxiosResponse(status: number, body?: unknown): AxiosResponse<string> {
  return {
    status,
    statusText: String(status),
    headers: {},
    config: { headers: {} } as AxiosResponse<string>['config'],
    data: body === undefined ? '' : JSON.stringify(body),
  }
}

describe('apiRequest unauthorized session handling', () => {
  const handler = vi.fn()

  beforeEach(() => {
    handler.mockClear()
    requestMock.mockReset()
    setUnauthorizedSessionHandler(handler)
  })

  afterEach(() => {
    setUnauthorizedSessionHandler(null)
  })

  it('triggers the unauthorized-session handler for authenticated 401 responses', async () => {
    requestMock.mockResolvedValueOnce(mockAxiosResponse(401, { error: 'Session expired' }))

    await expect(apiRequest('/users/1', { token: 'test-jwt' })).rejects.toMatchObject({
      status: 401,
      message: 'Session expired',
    })

    expect(handler).toHaveBeenCalledTimes(1)

    const config = requestMock.mock.calls[0]?.[0]
    expect(config?.headers?.Authorization).toBe('Bearer test-jwt')
  })

  it('does not trigger the handler for public requests (token: null) that return 401', async () => {
    requestMock.mockResolvedValueOnce(mockAxiosResponse(401, { error: 'Invalid credentials' }))

    await expect(
      apiRequest('/auth/login', {
        token: null,
        method: 'POST',
        body: { email: 'user@example.com', password: 'secret' },
      }),
    ).rejects.toMatchObject({
      status: 401,
      message: 'Invalid credentials',
    })

    expect(handler).not.toHaveBeenCalled()

    const config = requestMock.mock.calls[0]?.[0]
    expect(config?.headers?.Authorization).toBeUndefined()
  })

  it('does not trigger the handler for successful responses', async () => {
    requestMock.mockResolvedValueOnce(mockAxiosResponse(200, { id: 1, user_name: 'Alice' }))

    await expect(apiRequest('/users/1', { token: 'test-jwt' })).resolves.toEqual({
      id: 1,
      user_name: 'Alice',
    })

    expect(handler).not.toHaveBeenCalled()
  })

  it('preserves existing ApiError behavior for non-401 failures', async () => {
    requestMock.mockResolvedValueOnce(mockAxiosResponse(403, { error: 'Forbidden' }))

    try {
      await apiRequest('/admin/users', { token: 'test-jwt' })
      expect.fail('expected apiRequest to reject')
    } catch (error) {
      expect(isApiError(error)).toBe(true)
      expect(error).toBeInstanceOf(ApiError)
      expect((error as ApiError).status).toBe(403)
      expect((error as ApiError).message).toBe('Forbidden')
    }

    expect(handler).not.toHaveBeenCalled()
  })

  it('preserves existing ApiError behavior when the transport fails', async () => {
    requestMock.mockRejectedValueOnce(new TypeError('Network Error'))

    await expect(apiRequest('/users/1', { token: 'test-jwt' })).rejects.toMatchObject({
      status: 0,
      message: 'Unable to reach the server',
    })

    expect(handler).not.toHaveBeenCalled()
  })
})
