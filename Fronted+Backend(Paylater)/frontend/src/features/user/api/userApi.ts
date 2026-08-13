import { apiGet, apiPost, apiPut } from '@/shared/api/client'
import type {
  AvailableMerchant,
  CreatePaybackRequest,
  CreatePurchaseRequest,
  MessageResponse,
  UpdateUserNameRequest,
  UserProfile,
  UserTransaction,
} from '@/features/user/types'

function assertMessageResponse(data: MessageResponse, label: string): MessageResponse {
  if (typeof data.message !== 'string' || data.message.trim() === '') {
    throw new Error(`Unexpected ${label} response shape`)
  }
  return data
}

function assertUserProfile(data: UserProfile): UserProfile {
  if (
    typeof data.id !== 'number' ||
    typeof data.user_name !== 'string' ||
    typeof data.credit_limit !== 'string' ||
    typeof data.current_due !== 'string'
  ) {
    throw new Error('Unexpected user profile response shape')
  }
  return data
}

/**
 * Empty Go slices often serialize as JSON null.
 * Normalize to an empty array for a stable frontend contract.
 */
function normalizeTransactionList(data: UserTransaction[] | null): UserTransaction[] {
  if (data === null) {
    return []
  }
  if (!Array.isArray(data)) {
    throw new Error('Unexpected user transactions response shape')
  }
  return data
}

function normalizeAvailableMerchants(
  data: AvailableMerchant[] | null,
): AvailableMerchant[] {
  if (data === null) {
    return []
  }
  if (!Array.isArray(data)) {
    throw new Error('Unexpected available merchants response shape')
  }
  for (const merchant of data) {
    if (
      typeof merchant.id !== 'number' ||
      !Number.isSafeInteger(merchant.id) ||
      merchant.id <= 0 ||
      typeof merchant.merchant_name !== 'string' ||
      merchant.merchant_name.trim() === ''
    ) {
      throw new Error('Unexpected available merchant item shape')
    }
  }
  return data
}

/**
 * GET /users/:id — authenticated; caller must pass the session user id for normal users.
 */
export async function getUserById(id: number): Promise<UserProfile> {
  const response = await apiGet<UserProfile>(`/users/${id}`)
  return assertUserProfile(response)
}

/**
 * PUT /users/:id — updates user_name only.
 */
export async function updateUserName(
  id: number,
  body: UpdateUserNameRequest,
): Promise<MessageResponse> {
  const response = await apiPut<MessageResponse>(`/users/${id}`, body)
  return assertMessageResponse(response, 'user update')
}

/**
 * GET /transactions/user/:user_id — purchase and payback rows for one user.
 */
export async function getUserTransactions(
  userId: number,
): Promise<UserTransaction[]> {
  const response = await apiGet<UserTransaction[] | null>(
    `/transactions/user/${userId}`,
  )
  return normalizeTransactionList(response)
}

/**
 * GET /merchants/available — public catalog (id + merchant_name only).
 */
export async function getAvailableMerchants(): Promise<AvailableMerchant[]> {
  const response = await apiGet<AvailableMerchant[] | null>(
    '/merchants/available',
    { token: null },
  )
  return normalizeAvailableMerchants(response)
}

/**
 * POST /transactions — create a PURCHASE for the JWT subject.
 * Does not return the created transaction row.
 */
export async function createPurchase(
  body: CreatePurchaseRequest,
): Promise<MessageResponse> {
  const response = await apiPost<MessageResponse>('/transactions', body)
  return assertMessageResponse(response, 'purchase')
}

/**
 * POST /payback — create a PAYBACK for the JWT subject.
 * Does not return the created transaction row.
 */
export async function createPayback(
  body: CreatePaybackRequest,
): Promise<MessageResponse> {
  const response = await apiPost<MessageResponse>('/payback', body)
  return assertMessageResponse(response, 'payback')
}
