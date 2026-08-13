import type { ReactElement } from 'react'

export function MerchantRegisterHeader(): ReactElement {
  return (
    <header className="login-header">
      <p className="login-header__brand">PayLater</p>
      <h1 className="login-header__title">Become a PayLater merchant</h1>
      <p className="login-header__subtitle">
        Create your merchant account to accept pay-later purchases with a clear
        commission rate.
      </p>
    </header>
  )
}
