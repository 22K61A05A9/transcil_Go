import type { ReactElement, ReactNode } from 'react'

import { AuthProvider } from '@/shared/auth/AuthProvider'

type AppProvidersProps = {
  children: ReactNode
}

/**
 * Root provider composition for the application.
 */
export function AppProviders({ children }: AppProvidersProps): ReactElement {
  return <AuthProvider>{children}</AuthProvider>
}
