import type { Product } from '../types/product'

/** Litere mici, fără diacritice: „Căști” → „casti” */
export function normalize(text: string) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

/** Un produs se potrivește dacă toate cuvintele căutate apar în nume, brand, categorie sau descriere. */
export function searchProducts(products: Product[], query: string) {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return []

  return products.filter((product) => {
    const haystack = normalize(`${product.name} ${product.brand} ${product.category} ${product.description}`)
    return terms.every((term) => haystack.includes(term))
  })
}
