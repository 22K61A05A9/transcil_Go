import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'

type AppHeaderProps = {
  brandHref: string
  contextLabel: string
  roleLabel: string
  accountId: number
  menuOpen: boolean
  onToggleMenu: () => void
  onLogout: () => void
}

export function AppHeader({
  brandHref,
  contextLabel,
  roleLabel,
  accountId,
  menuOpen,
  onToggleMenu,
  onLogout,
}: AppHeaderProps): ReactElement {
  return (
    <header className="app-shell__header">
      <div className="app-shell__header-start">
        <button
          type="button"
          className="app-shell__menu-toggle"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="app-shell-mobile-nav"
          onClick={onToggleMenu}
        >
          <span className="app-shell__menu-toggle-bars" aria-hidden="true" />
          Menu
        </button>
        <Link className="app-shell__brand" to={brandHref}>
          PayLater
        </Link>
        <p className="app-shell__context">{contextLabel}</p>
      </div>

      <div className="app-shell__header-end">
        <div className="app-shell__account" aria-label="Signed-in account">
          <span className="app-shell__account-role">{roleLabel}</span>
          <span className="app-shell__account-id">ID {accountId}</span>
        </div>
        <button
          type="button"
          className="app-shell__logout"
          onClick={onLogout}
        >
          Log out
        </button>
      </div>
    </header>
  )
}
