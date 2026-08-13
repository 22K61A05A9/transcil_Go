/**
 * Decimal-safe money helpers for display/aggregation.
 * Operates in integer cents (BigInt) to avoid IEEE float drift.
 */

function normalizeMoneyInput(value: string): string {
  return value.trim()
}

/**
 * Parse a backend money string (e.g. "2000.00", "5") into integer cents.
 */
export function moneyToCents(value: string): bigint {
  const raw = normalizeMoneyInput(value)
  const match = /^(-?)(\d+)(?:\.(\d{0,2}))?$/.exec(raw)
  if (!match) {
    throw new Error(`Invalid money value: ${value}`)
  }

  const sign = match[1] === '-' ? -1n : 1n
  const whole = BigInt(match[2] ?? '0')
  const fraction = ((match[3] ?? '') + '00').slice(0, 2)
  const cents = whole * 100n + BigInt(fraction)
  return sign * cents
}

/** Format integer cents as a fixed 2-decimal string. */
export function centsToMoney(cents: bigint): string {
  const negative = cents < 0n
  const absolute = negative ? -cents : cents
  const whole = absolute / 100n
  const fraction = (absolute % 100n).toString().padStart(2, '0')
  return `${negative ? '-' : ''}${whole}.${fraction}`
}

export function subtractMoney(left: string, right: string): string {
  return centsToMoney(moneyToCents(left) - moneyToCents(right))
}

export function addMoney(left: string, right: string): string {
  return centsToMoney(moneyToCents(left) + moneyToCents(right))
}

/** Format for UI display without inventing currency symbols beyond the value. */
export function formatMoneyDisplay(value: string): string {
  try {
    return centsToMoney(moneyToCents(value))
  } catch {
    return value
  }
}
