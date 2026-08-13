import { apiPost } from '@/shared/api/client'
import type {
  LoginRequest,
  LoginResponse,
  RegisterMerchantRequest,
  RegisterMerchantResponse,
  RegisterUserRequest,
  RegisterUserResponse,
} from '@/features/auth/types'

function assertLoginResponse(data: LoginResponse): LoginResponse {
  if (typeof data.message !== 'string' || typeof data.token !== 'string') {
    throw new Error('Unexpected login response shape')
  }
  if (data.token.trim() === '') {
    throw new Error('Login response did not include a token')
  }
  return data
}

function assertMessageResponse(data: { message: string }, label: string): { message: string } {
  if (typeof data.message !== 'string' || data.message.trim() === '') {
    throw new Error(`Unexpected ${label} response shape`)
  }
  return data
}

/**
 * POST /user/login — public.
 * Does not persist the token; the caller decides when to store it.
 */
export async function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiPost<LoginResponse>('/user/login', credentials, {
    token: null,
  })
  return assertLoginResponse(response)
}

/**
 * POST /merchant/login — public.
 */
export async function loginMerchant(
  credentials: LoginRequest,
): Promise<LoginResponse> {
  const response = await apiPost<LoginResponse>('/merchant/login', credentials, {
    token: null,
  })
  return assertLoginResponse(response)
}

/**
 * POST /admin/login — public.
 */
export async function loginAdmin(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiPost<LoginResponse>('/admin/login', credentials, {
    token: null,
  })
  return assertLoginResponse(response)
}

/**
 * POST /users — public user self-registration.
 * Does not return a JWT; the user must log in afterwards.
 */
export async function registerUser(
  payload: RegisterUserRequest,
): Promise<RegisterUserResponse> {
  const response = await apiPost<RegisterUserResponse>('/users', payload, {
    token: null,
  })
  return assertMessageResponse(response, 'registration')
}

/**
 * POST /merchants/register — public merchant self-registration.
 * Does not return a JWT; the merchant must log in afterwards.
 * Do not call Admin POST /merchants from the public UI.
 */
export async function registerMerchant(
  payload: RegisterMerchantRequest,
): Promise<RegisterMerchantResponse> {
  const response = await apiPost<RegisterMerchantResponse>(
    '/merchants/register',
    payload,
    { token: null },
  )
  return assertMessageResponse(response, 'registration')
}
