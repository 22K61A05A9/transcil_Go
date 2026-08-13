import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'

import {
  getStoredSession,
  persistSessionFromToken,
} from '@/shared/auth/session'
import { clearSession } from '@/shared/auth/tokenStorage'
import type { AuthRole, AuthSession } from '@/shared/auth/types'

export type AuthContextValue = {
  session: AuthSession | null
  isAuthenticated: boolean
  /** Entity id from the JWT `id` claim when authenticated. */
  userId: number | null
  role: AuthRole | null
  /**
   * Persist a JWT from the auth API and update React session state.
   * Does not call login HTTP endpoints.
   */
  login: (token: string) => void
  /** Clear stored token and React session (client-side only). */
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

type AuthProviderProps = {
  children: ReactNode
}

/**
 * Holds client-side authentication STATE for the React tree.
 * Networking stays in features/auth/api; JWT/storage stay in shared/auth utilities.
 */
export function AuthProvider({ children }: AuthProviderProps): ReactElement {
  // Synchronous localStorage read — avoids a logged-out flash on startup.
  const [session, setSession] = useState<AuthSession | null>(() =>
    getStoredSession(),
  )

  const login = useCallback((token: string) => {
    const nextSession = persistSessionFromToken(token)
    setSession(nextSession)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      userId: session === null ? null : session.id,
      role: session === null ? null : session.role,
      login,
      logout,
    }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
