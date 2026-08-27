import { apiPost } from '@/shared/api/client'
import { assertMessageResponse } from '@/shared/api/response'
import { GUEST_API_ENDPOINTS } from '@/shared/config/guestAccess'
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

/**
 * POST /user/login — public.
 * Does not persist the token; the caller decides when to store it.
 */
export async function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiPost<LoginResponse>(
    GUEST_API_ENDPOINTS.userLogin,
    credentials,
    { token: null },
  )
  return assertLoginResponse(response)
}

/**
 * POST /merchant/login — public.
 */
export async function loginMerchant(
  credentials: LoginRequest,
): Promise<LoginResponse> {
  const response = await apiPost<LoginResponse>(
    GUEST_API_ENDPOINTS.merchantLogin,
    credentials,
    { token: null },
  )
  return assertLoginResponse(response)
}

/**
 * POST /admin/login — public.
 */
export async function loginAdmin(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiPost<LoginResponse>(
    GUEST_API_ENDPOINTS.adminLogin,
    credentials,
    { token: null },
  )
  return assertLoginResponse(response)
}

/**
 * POST /users — public user self-registration.
 * Does not return a JWT; the user must log in afterwards.
 */
export async function registerUser(
  payload: RegisterUserRequest,
): Promise<RegisterUserResponse> {
  const response = await apiPost<RegisterUserResponse>(
    GUEST_API_ENDPOINTS.userRegister,
    payload,
    { token: null },
  )
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
    GUEST_API_ENDPOINTS.merchantRegister,
    payload,
    { token: null },
  )
  return assertMessageResponse(response, 'registration')
}
