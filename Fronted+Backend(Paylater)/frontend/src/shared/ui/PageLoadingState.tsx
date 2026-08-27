import type { ReactElement } from 'react'

type PageLoadingStateProps = {
  message: string
  /** When true, sets `aria-live="polite"` on the status container. */
  live?: boolean
}

export function PageLoadingState({
  message,
  live = false,
}: PageLoadingStateProps): ReactElement {
  return (
    <div
      className="user-dashboard__status"
      role="status"
      {...(live ? { 'aria-live': 'polite' as const } : {})}
    >
      <p className="user-dashboard__loading">{message}</p>
    </div>
  )
}
