import db from '../data/db.json'
import type { Category } from '../types/category'

// Mock pentru Firestore: getDocs(query(collection(firestore, 'categories'), orderBy('order')))
export async function getCategories(): Promise<Category[]> {
  return [...(db.categories as Category[])].sort((a, b) => a.order - b.order)
}
