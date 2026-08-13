import type { ReactElement } from 'react'

export function LoginHeader(): ReactElement {
  return (
    <header className="login-header">
      <p className="login-header__brand">PayLater</p>
      <h1 className="login-header__title">Secure financial management</h1>
      <p className="login-header__subtitle">
        Sign in to manage credit, purchases, and settlements with confidence.
      </p>
    </header>
  )
}
