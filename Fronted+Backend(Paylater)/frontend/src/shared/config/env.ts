/**
 * Typed access to Vite public environment variables.
 * Never put secrets or INTERNAL_SERVICE_TOKEN here.
 */
function requireEnv(name: keyof ImportMetaEnv, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value.replace(/\/$/, '')
}

export const env = {
  apiBaseUrl: requireEnv('VITE_API_BASE_URL', import.meta.env.VITE_API_BASE_URL),
} as const
