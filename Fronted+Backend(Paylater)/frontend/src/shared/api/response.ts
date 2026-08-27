import type { MessageResponse } from '@/shared/api/dtos'

/**
 * Validate a backend `{ message: string }` success envelope at runtime.
 */
export function assertMessageResponse(
  data: MessageResponse,
  label: string,
): MessageResponse {
  if (typeof data.message !== 'string' || data.message.trim() === '') {
    throw new Error(`Unexpected ${label} response shape`)
  }
  return data
}
