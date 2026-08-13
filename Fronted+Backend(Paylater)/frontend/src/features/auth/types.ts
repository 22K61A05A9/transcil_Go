export type LoginRequest = {
  email: string
  password: string
}

export type LoginResponse = {
  message: string
  token: string
}

export type AuthLoginActor = 'user' | 'merchant' | 'admin'

export type RegisterMerchantRequest = {
  merchant_name: string
  email: string
  password: string
  phone_number?: string
  commission_percentage: string
}

export type RegisterMerchantResponse = {
  message: string
}

export type RegisterUserRequest = {
  user_name: string
  email: string
  password: string
}

export type RegisterUserResponse = {
  message: string
}

/** Navigation state passed from registration → /login (never includes password). */
export type LoginNavigationState = {
  registeredEmail?: string
  registeredActor?: AuthLoginActor
  registrationSuccess?: boolean
}
