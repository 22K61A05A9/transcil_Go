import { useEffect, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'

import { setUnauthorizedSessionHandler } from '@/shared/api/unauthorizedSession'
import { useAuth } from '@/shared/auth/useAuth'
import { GUEST_ROUTE_PATHS } from '@/shared/config/guestAccess'

/**
 * Wires centralized 401 session expiry handling into AuthProvider + React Router.
 */
export function UnauthorizedSessionHandler(): ReactElement | null {
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    setUnauthorizedSessionHandler(() => {
      logout()
      void navigate(GUEST_ROUTE_PATHS.login, { replace: true })
    })

    return () => {
      setUnauthorizedSessionHandler(null)
    }
  }, [logout, navigate])

  return null
}
