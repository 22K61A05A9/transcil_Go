import { formatMoneyDisplay } from '@/shared/lib/money'

/** Formats money for fintech UI display with thousands separators. */
export function formatCurrencyPresentation(value: string): string {
  const formatted = formatMoneyDisplay(value)
  const parts = formatted.split('.')
  const wholePart = parts[0] ?? '0'
  const fractionPart = parts[1] ?? '00'
  const withCommas = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${withCommas}.${fractionPart}`
}
