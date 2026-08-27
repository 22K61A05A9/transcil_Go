import axios from 'axios'

import { env } from '@/shared/config/env'

/**
 * Single Axios instance for all PayLater API traffic.
 * Request/response handling stays in `client.ts` to preserve existing behavior.
 */
export const axiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  validateStatus: () => true,
})
