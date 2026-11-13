import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Product } from '../types/product'

// Catalogul se citește o singură dată pe sesiune și se păstrează în memorie,
// ca să nu citim cele 100 de documente la fiecare schimbare de pagină.
// După orice modificare făcută de admin, cache-ul se golește.
let cache: Promise<Product[]> | null = null

async function fetchProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, 'products'))
  return snapshot.docs
    .map((d) => ({ ...(d.data() as Omit<Product, 'id'>), id: d.id }))
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
}

export function getProducts(): Promise<Product[]> {
  if (!cache) {
    cache = fetchProducts().catch((error: unknown) => {
      cache = null // la eroare, următoarea încercare citește din nou
      throw error
    })
  }
  return cache
}

/** Forțează recitirea catalogului (după modificări). */
export function invalidateProductsCache() {
  cache = null
}

// ---- Operații de administrare (permise doar adminilor de regulile Firestore) ----

/** Următorul id liber de forma p001, p002… (după cel mai mare id existent). */
export function nextProductId(products: Product[]): string {
  const max = products.reduce((highest, p) => {
    const match = /^p(\d+)$/.exec(p.id)
    return match ? Math.max(highest, Number(match[1])) : highest
  }, 0)
  return `p${String(max + 1).padStart(3, '0')}`
}

/** Creează sau înlocuiește complet un produs. */
export async function saveProduct(product: Product): Promise<void> {
  const { id, ...data } = product
  // Firestore nu acceptă `undefined`: câmpurile opționale goale se omit
  const clean = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined))
  await setDoc(doc(db, 'products', id), clean)
  invalidateProductsCache()
}

/** Modifică doar stocul unui produs. */
export async function updateStock(productId: string, stock: number): Promise<void> {
  await updateDoc(doc(db, 'products', productId), { stock })
  invalidateProductsCache()
}

export async function productExists(productId: string): Promise<boolean> {
  return (await getDoc(doc(db, 'products', productId))).exists()
}
