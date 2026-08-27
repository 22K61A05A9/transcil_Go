import type { ReactElement } from 'react'

type PageSkeletonProps = {
  label: string
  variant?: 'dashboard' | 'table' | 'form' | 'profile'
}

export function PageSkeleton({
  label,
  variant = 'table',
}: PageSkeletonProps): ReactElement {
  if (variant === 'dashboard') {
    return (
      <div
        className="user-dashboard pl-page pl-page--loading"
        aria-busy="true"
        aria-live="polite"
        aria-label={label}
      >
        <div className="user-dashboard__skeleton user-dashboard__skeleton--hero" />
        <div className="user-dashboard__skeleton-grid" aria-hidden="true">
          <div className="user-dashboard__skeleton user-dashboard__skeleton--card" />
          <div className="user-dashboard__skeleton user-dashboard__skeleton--card" />
          <div className="user-dashboard__skeleton user-dashboard__skeleton--card" />
        </div>
        <div className="user-dashboard__skeleton-layout" aria-hidden="true">
          <div className="user-dashboard__skeleton user-dashboard__skeleton--section" />
          <div className="user-dashboard__skeleton user-dashboard__skeleton--section" />
        </div>
      </div>
    )
  }

  if (variant === 'form') {
    return (
      <div
        className="pl-page pl-page--loading"
        aria-busy="true"
        aria-live="polite"
        aria-label={label}
      >
        <div className="user-dashboard__skeleton user-dashboard__skeleton--hero" />
        <div className="user-dashboard__skeleton user-dashboard__skeleton--section" />
      </div>
    )
  }

  if (variant === 'profile') {
    return (
      <div
        className="profile-page pl-page pl-page--loading"
        aria-busy="true"
        aria-live="polite"
        aria-label={label}
      >
        <div className="user-dashboard__skeleton user-dashboard__skeleton--hero" />
        <div className="user-dashboard__skeleton user-dashboard__skeleton--section" />
      </div>
    )
  }

  return (
    <div
      className="user-transactions pl-page pl-page--loading"
      aria-busy="true"
      aria-live="polite"
      aria-label={label}
    >
      <div className="user-dashboard__skeleton user-dashboard__skeleton--hero" />
      <div className="user-dashboard__skeleton-grid" aria-hidden="true">
        <div className="user-dashboard__skeleton user-dashboard__skeleton--card" />
        <div className="user-dashboard__skeleton user-dashboard__skeleton--card" />
        <div className="user-dashboard__skeleton user-dashboard__skeleton--card" />
      </div>
      <div className="user-dashboard__skeleton user-dashboard__skeleton--section" />
    </div>
  )
}
