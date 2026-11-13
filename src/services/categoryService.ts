import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Category } from '../types/category'

let cache: Promise<Category[]> | null = null

async function fetchCategories(): Promise<Category[]> {
  const snapshot = await getDocs(query(collection(db, 'categories'), orderBy('order')))
  return snapshot.docs.map((doc) => ({ ...(doc.data() as Omit<Category, 'id'>), id: doc.id }))
}

export function getCategories(): Promise<Category[]> {
  if (!cache) {
    cache = fetchCategories().catch((error: unknown) => {
      cache = null
      throw error
    })
  }
  return cache
}
