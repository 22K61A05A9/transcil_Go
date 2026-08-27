import type { ReactElement, ReactNode } from 'react'

type PageLoadErrorProps = {
  title: string
  message: string
  onRetry?: () => void
  /** When false, hides the default retry button (e.g. forbidden responses). */
  showRetry?: boolean
  /** Replaces the default retry button when provided. */
  children?: ReactNode
}

export function PageLoadError({
  title,
  message,
  onRetry,
  showRetry = true,
  children,
}: PageLoadErrorProps): ReactElement {
  return (
    <div className="user-dashboard__error" role="alert">
      <h1 className="user-dashboard__error-title">{title}</h1>
      <p className="user-dashboard__error-message">{message}</p>
      {children ??
        (onRetry !== undefined && showRetry ? (
          <button type="button" className="user-dashboard__retry" onClick={onRetry}>
            Retry
          </button>
        ) : null)}
    </div>
  )
}
