import { addDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { NewReview, Review } from '../types/review'

export async function getReviews(productId: string): Promise<Review[]> {
  // Sortăm în aplicație, nu cu orderBy: where + orderBy pe câmpuri diferite ar cere un index compus.
  const snapshot = await getDocs(query(collection(db, 'reviews'), where('productId', '==', productId)))
  return snapshot.docs
    .map((doc) => ({ ...(doc.data() as Omit<Review, 'id'>), id: doc.id }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** Necesită utilizator autentificat (vezi regulile din firestore.rules). */
export async function addReview(input: NewReview): Promise<Review> {
  const data = { ...input, createdAt: new Date().toISOString() }
  const ref = await addDoc(collection(db, 'reviews'), data)
  return { ...data, id: ref.id }
}
