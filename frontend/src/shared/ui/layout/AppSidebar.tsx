import { NavLink } from 'react-router-dom'
import type { ReactElement } from 'react'

import type { AppNavItem } from '@/shared/ui/layout/navConfig'

type AppSidebarProps = {
  items: readonly AppNavItem[]
}

export function AppSidebar({ items }: AppSidebarProps): ReactElement {
  return (
    <aside className="app-shell__sidebar" aria-label="Primary">
      <nav className="app-shell__nav" aria-label="Application">
        <ul className="app-shell__nav-list">
          {items.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end
                className={({ isActive }) =>
                  isActive
                    ? 'app-shell__nav-link app-shell__nav-link--active'
                    : 'app-shell__nav-link'
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
