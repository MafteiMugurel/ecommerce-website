import { currentLocale } from '../i18n'

// Formatarea urmează limba aleasă (ro-RO: „1.899,00 RON”, en-US: „RON 1,899.00”).

export function formatPrice(price: number, currency = 'RON') {
  return new Intl.NumberFormat(currentLocale(), { style: 'currency', currency }).format(price)
}

export function formatDate(iso: string, withTime = false) {
  return new Date(iso).toLocaleDateString(currentLocale(), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

export function formatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat(currentLocale(), { maximumFractionDigits }).format(value)
}

/** Format scurt pentru axe și carduri: 12.500 → „12,5 mii lei” / „12.5K RON”. */
export function formatCompactPrice(value: number) {
  const number = new Intl.NumberFormat(currentLocale(), { notation: 'compact', maximumFractionDigits: 1 }).format(value)
  return currentLocale() === 'ro-RO' ? `${number} lei` : `${number} RON`
}
