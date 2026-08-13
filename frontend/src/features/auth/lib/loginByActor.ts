import {
  loginAdmin,
  loginMerchant,
  loginUser,
} from '@/features/auth/api/authApi'
import type { AuthLoginActor, LoginRequest, LoginResponse } from '@/features/auth/types'

/**
 * Dispatch to the correct gateway login endpoint for the selected UI actor.
 */
export async function loginByActor(
  actor: AuthLoginActor,
  credentials: LoginRequest,
): Promise<LoginResponse> {
  switch (actor) {
    case 'user':
      return loginUser(credentials)
    case 'merchant':
      return loginMerchant(credentials)
    case 'admin':
      return loginAdmin(credentials)
  }
}
