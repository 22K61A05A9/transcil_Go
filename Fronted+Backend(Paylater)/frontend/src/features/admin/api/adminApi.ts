import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from '@/shared/api/client'
import type {
  AdminMerchant,
  AdminProfile,
  AdminRole,
  AdminTransaction,
  AdminUser,
  CreateAdminMerchantRequest,
  CreateAdminRequest,
  MerchantFeeResponse,
  MessageResponse,
  ReportUserRow,
  TotalDueResponse,
  UpdateAdminMerchantRequest,
  UpdateAdminUserRequest,
  UpdateMerchantCommissionRequest,
  UserDueResponse,
} from '@/features/admin/types'

function assertMessageResponse(data: MessageResponse, label: string): MessageResponse {
  if (typeof data.message !== 'string' || data.message.trim() === '') {
    throw new Error(`Unexpected ${label} response shape`)
  }
  return data
}

function isAdminRole(value: string): value is AdminRole {
  return value === 'ADMIN' || value === 'SUPER_ADMIN'
}

function assertAdminProfile(data: AdminProfile): AdminProfile {
  if (
    typeof data.id !== 'number' ||
    !Number.isSafeInteger(data.id) ||
    data.id <= 0 ||
    typeof data.admin_name !== 'string' ||
    typeof data.email !== 'string' ||
    !isAdminRole(data.role)
  ) {
    throw new Error('Unexpected admin profile response shape')
  }
  return data
}

function assertAdminUser(data: AdminUser): AdminUser {
  if (
    typeof data.id !== 'number' ||
    !Number.isSafeInteger(data.id) ||
    data.id <= 0 ||
    typeof data.user_name !== 'string' ||
    typeof data.credit_limit !== 'string' ||
    typeof data.current_due !== 'string'
  ) {
    throw new Error('Unexpected admin user response shape')
  }
  return data
}

function assertAdminMerchant(data: AdminMerchant): AdminMerchant {
  if (
    typeof data.id !== 'number' ||
    !Number.isSafeInteger(data.id) ||
    data.id <= 0 ||
    typeof data.merchant_name !== 'string' ||
    typeof data.email !== 'string' ||
    typeof data.phone_number !== 'string' ||
    typeof data.commission_percentage !== 'string'
  ) {
    throw new Error('Unexpected admin merchant response shape')
  }
  return data
}

function assertAdminTransaction(data: AdminTransaction): AdminTransaction {
  if (
    typeof data.id !== 'number' ||
    typeof data.user_id !== 'number' ||
    typeof data.merchant_id !== 'object' ||
    data.merchant_id === null ||
    typeof data.merchant_id.Int32 !== 'number' ||
    typeof data.merchant_id.Valid !== 'boolean' ||
    (data.transaction_type !== 'PURCHASE' && data.transaction_type !== 'PAYBACK') ||
    typeof data.amount !== 'string' ||
    typeof data.commission !== 'string' ||
    typeof data.commission_percentage !== 'string'
  ) {
    throw new Error('Unexpected admin transaction response shape')
  }
  return data
}

function assertReportUserRow(data: ReportUserRow): ReportUserRow {
  if (
    typeof data.id !== 'number' ||
    typeof data.user_name !== 'string' ||
    typeof data.credit_limit !== 'string' ||
    typeof data.current_due !== 'string'
  ) {
    throw new Error('Unexpected report user row shape')
  }
  return data
}

function normalizeList<T>(
  data: T[] | null,
  label: string,
  assertItem: (item: T) => T,
): T[] {
  if (data === null) {
    return []
  }
  if (!Array.isArray(data)) {
    throw new Error(`Unexpected ${label} response shape`)
  }
  return data.map(assertItem)
}

function assertTotalDueResponse(data: TotalDueResponse): TotalDueResponse {
  if (typeof data.total_due !== 'string') {
    throw new Error('Unexpected total due response shape')
  }
  return data
}

function assertMerchantFeeResponse(data: MerchantFeeResponse): MerchantFeeResponse {
  if (typeof data.total_fee !== 'string') {
    throw new Error('Unexpected merchant fee response shape')
  }
  return data
}

function assertUserDueResponse(data: UserDueResponse): UserDueResponse {
  if (typeof data.current_due !== 'string') {
    throw new Error('Unexpected user due response shape')
  }
  return data
}

// ---------- Admins ----------

/** GET /admins */
export async function getAdmins(): Promise<AdminProfile[]> {
  const response = await apiGet<AdminProfile[] | null>('/admins')
  return normalizeList(response, 'admins list', assertAdminProfile)
}

/** GET /admins/:id */
export async function getAdminById(id: number): Promise<AdminProfile> {
  const response = await apiGet<AdminProfile>(`/admins/${id}`)
  return assertAdminProfile(response)
}

/** POST /admins — backend requires SUPER_ADMIN JWT. */
export async function createAdmin(body: CreateAdminRequest): Promise<MessageResponse> {
  const response = await apiPost<MessageResponse>('/admins', body)
  return assertMessageResponse(response, 'admin create')
}

/** DELETE /admins/:id — backend requires SUPER_ADMIN JWT. */
export async function deleteAdmin(id: number): Promise<MessageResponse> {
  const response = await apiDelete<MessageResponse>(`/admins/${id}`)
  return assertMessageResponse(response, 'admin delete')
}

// ---------- Users ----------

/** GET /users */
export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await apiGet<AdminUser[] | null>('/users')
  return normalizeList(response, 'users list', assertAdminUser)
}

/** GET /users/:id */
export async function getAdminUserById(id: number): Promise<AdminUser> {
  const response = await apiGet<AdminUser>(`/users/${id}`)
  return assertAdminUser(response)
}

/** PUT /users/:id */
export async function updateAdminUser(
  id: number,
  body: UpdateAdminUserRequest,
): Promise<MessageResponse> {
  const response = await apiPut<MessageResponse>(`/users/${id}`, body)
  return assertMessageResponse(response, 'user update')
}

/** DELETE /users/:id */
export async function deleteAdminUser(id: number): Promise<MessageResponse> {
  const response = await apiDelete<MessageResponse>(`/users/${id}`)
  return assertMessageResponse(response, 'user delete')
}

// ---------- Merchants ----------

/** GET /merchants */
export async function getAdminMerchants(): Promise<AdminMerchant[]> {
  const response = await apiGet<AdminMerchant[] | null>('/merchants')
  return normalizeList(response, 'merchants list', assertAdminMerchant)
}

/** GET /merchants/:id */
export async function getAdminMerchantById(id: number): Promise<AdminMerchant> {
  const response = await apiGet<AdminMerchant>(`/merchants/${id}`)
  return assertAdminMerchant(response)
}

/** POST /merchants */
export async function createAdminMerchant(
  body: CreateAdminMerchantRequest,
): Promise<MessageResponse> {
  const response = await apiPost<MessageResponse>('/merchants', body)
  return assertMessageResponse(response, 'merchant create')
}

/** PUT /merchants/:id */
export async function updateAdminMerchant(
  id: number,
  body: UpdateAdminMerchantRequest,
): Promise<MessageResponse> {
  const response = await apiPut<MessageResponse>(`/merchants/${id}`, body)
  return assertMessageResponse(response, 'merchant update')
}

/** PATCH /merchants/:id/commission */
export async function updateAdminMerchantCommission(
  id: number,
  body: UpdateMerchantCommissionRequest,
): Promise<MessageResponse> {
  const response = await apiPatch<MessageResponse>(
    `/merchants/${id}/commission`,
    body,
  )
  return assertMessageResponse(response, 'merchant commission update')
}

/** DELETE /merchants/:id */
export async function deleteAdminMerchant(id: number): Promise<MessageResponse> {
  const response = await apiDelete<MessageResponse>(`/merchants/${id}`)
  return assertMessageResponse(response, 'merchant delete')
}

// ---------- Transactions ----------

/** GET /transactions */
export async function getAdminTransactions(): Promise<AdminTransaction[]> {
  const response = await apiGet<AdminTransaction[] | null>('/transactions')
  return normalizeList(response, 'transactions list', assertAdminTransaction)
}

/** GET /transactions/:id */
export async function getAdminTransactionById(id: number): Promise<AdminTransaction> {
  const response = await apiGet<AdminTransaction>(`/transactions/${id}`)
  return assertAdminTransaction(response)
}

/** GET /transactions/user/:user_id */
export async function getAdminTransactionsByUser(
  userId: number,
): Promise<AdminTransaction[]> {
  const response = await apiGet<AdminTransaction[] | null>(
    `/transactions/user/${userId}`,
  )
  return normalizeList(response, 'user transactions list', assertAdminTransaction)
}

/** GET /transactions/merchant/:merchant_id */
export async function getAdminTransactionsByMerchant(
  merchantId: number,
): Promise<AdminTransaction[]> {
  const response = await apiGet<AdminTransaction[] | null>(
    `/transactions/merchant/${merchantId}`,
  )
  return normalizeList(response, 'merchant transactions list', assertAdminTransaction)
}

// ---------- Reports ----------

/** GET /users/credit-limit */
export async function getUsersAtCreditLimit(): Promise<ReportUserRow[]> {
  const response = await apiGet<ReportUserRow[] | null>('/users/credit-limit')
  return normalizeList(response, 'credit limit users list', assertReportUserRow)
}

/** GET /customers-with-due */
export async function getCustomersWithDue(): Promise<ReportUserRow[]> {
  const response = await apiGet<ReportUserRow[] | null>('/customers-with-due')
  return normalizeList(response, 'customers with due list', assertReportUserRow)
}

/** GET /total-due */
export async function getTotalDue(): Promise<TotalDueResponse> {
  const response = await apiGet<TotalDueResponse>('/total-due')
  return assertTotalDueResponse(response)
}

/** GET /merchant/:merchant_id/fee */
export async function getMerchantFeeCollected(
  merchantId: number,
): Promise<MerchantFeeResponse> {
  const response = await apiGet<MerchantFeeResponse>(
    `/merchant/${merchantId}/fee`,
  )
  return assertMerchantFeeResponse(response)
}

/** GET /user/:user_id/due */
export async function getAdminUserDue(userId: number): Promise<UserDueResponse> {
  const response = await apiGet<UserDueResponse>(`/user/${userId}/due`)
  return assertUserDueResponse(response)
}
