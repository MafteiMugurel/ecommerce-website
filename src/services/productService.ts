import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Product } from '../types/product'

// Catalogul se citește o singură dată pe sesiune și se păstrează în memorie,
// ca să nu citim cele 100 de documente la fiecare schimbare de pagină.
let cache: Promise<Product[]> | null = null

async function fetchProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, 'products'))
  return snapshot.docs
    .map((doc) => ({ ...(doc.data() as Omit<Product, 'id'>), id: doc.id }))
    .sort((a, b) => a.id.localeCompare(b.id))
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
