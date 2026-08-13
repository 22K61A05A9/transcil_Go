import type { ReactElement } from 'react'

export function RegisterHeader(): ReactElement {
  return (
    <header className="login-header">
      <p className="login-header__brand">PayLater</p>
      <h1 className="login-header__title">Create your PayLater account</h1>
      <p className="login-header__subtitle">
        Register once to shop with pay-later credit and manage your balance with
        confidence.
      </p>
    </header>
  )
}
