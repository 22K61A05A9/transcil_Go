import { apiGet, apiPut } from '@/shared/api/client'
import type {
  MerchantProfile,
  MerchantTransaction,
  UpdateMerchantProfileRequest,
} from '@/features/merchant/types'
import type { MessageResponse } from '@/features/user/types'

function assertMerchantProfile(data: MerchantProfile): MerchantProfile {
  if (
    typeof data.id !== 'number' ||
    !Number.isSafeInteger(data.id) ||
    data.id <= 0 ||
    typeof data.merchant_name !== 'string' ||
    typeof data.email !== 'string' ||
    typeof data.phone_number !== 'string' ||
    typeof data.commission_percentage !== 'string'
  ) {
    throw new Error('Unexpected merchant profile response shape')
  }
  return data
}

/**
 * Empty Go slices often serialize as JSON null.
 * Normalize to an empty array for a stable frontend contract.
 */
function normalizeMerchantTransactionList(
  data: MerchantTransaction[] | null,
): MerchantTransaction[] {
  if (data === null) {
    return []
  }
  if (!Array.isArray(data)) {
    throw new Error('Unexpected merchant transactions response shape')
  }
  return data
}

/**
 * GET /merchants/:id — authenticated.
 * Merchant JWT may only request its own id (MerchantMiddleware).
 * Admin/SUPER_ADMIN may request any id.
 * Does not return password.
 */
export async function getMerchantById(id: number): Promise<MerchantProfile> {
  const response = await apiGet<MerchantProfile>(`/merchants/${id}`)
  return assertMerchantProfile(response)
}

/**
 * GET /transactions/merchant/:merchant_id — authenticated.
 * Merchant JWT may only request its own merchant_id.
 * Admin/SUPER_ADMIN may request any merchant_id.
 * Does not invent fields; returns Transaction service rows as-is.
 */
export async function getMerchantTransactions(
  merchantId: number,
): Promise<MerchantTransaction[]> {
  const response = await apiGet<MerchantTransaction[] | null>(
    `/transactions/merchant/${merchantId}`,
  )
  return normalizeMerchantTransactionList(response)
}

function assertMessageResponse(data: MessageResponse, label: string): MessageResponse {
  if (typeof data.message !== 'string' || data.message.trim() === '') {
    throw new Error(`Unexpected ${label} response shape`)
  }
  return data
}

/**
 * PUT /merchants/:id — merchant_name and phone_number only.
 * Merchant JWT may only update its own id; admins may update any merchant.
 */
export async function updateMerchantProfile(
  id: number,
  body: UpdateMerchantProfileRequest,
): Promise<MessageResponse> {
  const response = await apiPut<MessageResponse>(`/merchants/${id}`, body)
  return assertMessageResponse(response, 'merchant update')
}
