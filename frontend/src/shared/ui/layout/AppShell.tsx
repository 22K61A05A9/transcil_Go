import { useCallback, useMemo, useState, type ReactElement } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'

import { getHomePathForRole } from '@/shared/auth/getHomePathForRole'
import { useAuth } from '@/shared/auth/useAuth'
import { AppHeader } from '@/shared/ui/layout/AppHeader'
import { AppSidebar } from '@/shared/ui/layout/AppSidebar'
import { MobileNavigation } from '@/shared/ui/layout/MobileNavigation'
import {
  getAreaContextLabel,
  getNavItemsForRole,
  getRoleDisplayLabel,
} from '@/shared/ui/layout/navConfig'
import '@/shared/ui/layout/app-shell.css'

/**
 * Authenticated application chrome: header, sidebar, mobile nav, and Outlet.
 * Contains no feature/business logic — presentation and logout only.
 */
export function AppShell(): ReactElement {
  const navigate = useNavigate()
  const { isAuthenticated, role, userId, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = useCallback((): void => {
    setMenuOpen(false)
  }, [])

  const navItems = useMemo(
    () => (role === null ? [] : getNavItemsForRole(role)),
    [role],
  )

  if (!isAuthenticated || role === null || userId === null) {
    return <Navigate to="/login" replace />
  }

  const homePath = getHomePathForRole(role)

  function handleLogout(): void {
    setMenuOpen(false)
    logout()
    void navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <AppHeader
        brandHref={homePath}
        contextLabel={getAreaContextLabel(role)}
        roleLabel={getRoleDisplayLabel(role)}
        accountId={userId}
        menuOpen={menuOpen}
        onToggleMenu={() => {
          setMenuOpen((current) => !current)
        }}
        onLogout={handleLogout}
      />

      <div className="app-shell__body">
        <AppSidebar items={navItems} />
        <main className="app-shell__main" id="app-shell-main">
          <Outlet />
        </main>
      </div>

      <div id="app-shell-mobile-nav">
        <MobileNavigation
          open={menuOpen}
          items={navItems}
          onClose={closeMenu}
        />
      </div>
    </div>
  )
}
