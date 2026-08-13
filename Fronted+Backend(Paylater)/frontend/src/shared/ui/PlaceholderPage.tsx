import type { ReactElement } from 'react'

type PlaceholderPageProps = {
  title: string
  description: string
}

/**
 * Temporary route content used while feature screens are not yet implemented.
 * Intended to render inside AppShell's main Outlet.
 */
export function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps): ReactElement {
  return (
    <div className="placeholder-page">
      <div className="placeholder-page__panel">
        <p className="placeholder-page__eyebrow">PayLater</p>
        <h1 className="placeholder-page__title">{title}</h1>
        <p className="placeholder-page__description">{description}</p>
      </div>
    </div>
  )
}
