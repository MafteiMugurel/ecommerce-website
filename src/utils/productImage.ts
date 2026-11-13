import ro from '../i18n/locales/ro'

// Ilustrația locală a fiecărei categorii (public/images/categories/*.svg).
// Se folosește când produsul nu are poză sau când poza externă nu se poate încărca.
const FILE_BY_CATEGORY_ID: Record<string, string> = {
  'componente-pc': 'componente',
  periferice: 'periferice',
  audio: 'audio',
  gaming: 'gaming',
  servere: 'servere',
  imprimante: 'imprimante',
  retelistica: 'retelistica',
  stocare: 'stocare',
}

const idByRomanianName = new Map(Object.entries(ro.categories).map(([id, name]) => [name, id]))

export const GENERIC_PRODUCT_IMAGE = '/images/placeholder.svg'

/** Ilustrația de rezervă pentru o categorie (după numele românesc din baza de date). */
export function categoryImage(categoryName: string): string {
  const id = idByRomanianName.get(categoryName)
  const file = id ? FILE_BY_CATEGORY_ID[id] : undefined
  return file ? `/images/categories/${file}.svg` : GENERIC_PRODUCT_IMAGE
}
