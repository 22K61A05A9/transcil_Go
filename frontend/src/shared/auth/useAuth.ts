import { useContext } from 'react'

import {
  AuthContext,
  type AuthContextValue,
} from '@/shared/auth/AuthProvider'

/**
 * Access the authentication context.
 * Must be called under AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)

  if (value === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return value
}
