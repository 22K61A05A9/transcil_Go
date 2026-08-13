import { useEffect, useId, useRef, type ReactElement } from 'react'
import { NavLink } from 'react-router-dom'

import type { AppNavItem } from '@/shared/ui/layout/navConfig'

type MobileNavigationProps = {
  open: boolean
  items: readonly AppNavItem[]
  onClose: () => void
}

export function MobileNavigation({
  open,
  items,
  onClose,
}: MobileNavigationProps): ReactElement | null {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const previouslyFocused = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    const firstFocusable = panel?.querySelector<HTMLElement>('a, button')
    firstFocusable?.focus()

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="app-shell__mobile-nav">
      <button
        type="button"
        className="app-shell__mobile-backdrop"
        aria-label="Close navigation menu"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="app-shell__mobile-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="app-shell__mobile-panel-header">
          <h2 id={titleId} className="app-shell__mobile-panel-title">
            Navigation
          </h2>
          <button
            type="button"
            className="app-shell__mobile-close"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <nav aria-label="Application">
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
                  onClick={onClose}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
