import type { ReactElement } from 'react'

import { formatCurrencyPresentation } from '@/shared/lib/currencyPresentation'

type CurrencyAmountProps = {
  value: string
  className?: string
  symbol?: string
}

export function CurrencyAmount({
  value,
  className,
  symbol = '₹',
}: CurrencyAmountProps): ReactElement {
  return (
    <span className={className ?? 'user-dashboard__currency pl-currency'}>
      <span className="user-dashboard__currency-symbol pl-currency__symbol" aria-hidden="true">
        {symbol}
      </span>
      <span className="user-dashboard__currency-value pl-currency__value">{formatCurrencyPresentation(value)}</span>
    </span>
  )
}
