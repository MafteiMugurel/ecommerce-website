export function formatPrice(price: number, currency = 'RON') {
  return new Intl.NumberFormat('ro-RO', { style: 'currency', currency }).format(price)
}

export function formatDate(iso: string, withTime = false) {
  return new Date(iso).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

export function formatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat('ro-RO', { maximumFractionDigits }).format(value)
}
