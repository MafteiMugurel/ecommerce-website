import db from '../data/db.json'
import type { NewReview, Review } from '../types/review'

// Mock pentru Firestore:
//  - citire:  getDocs(query(collection(firestore, 'reviews'), where('productId', '==', id), orderBy('createdAt', 'desc')))
//  - scriere: addDoc(collection(firestore, 'reviews'), review)
// Recenziile scrise de utilizator se păstrează deocamdată în localStorage.

const STORAGE_KEY = 'user-reviews'

function loadUserReviews(): Review[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = saved ? JSON.parse(saved) : []
    return Array.isArray(parsed) ? (parsed as Review[]) : []
  } catch {
    return []
  }
}

export async function getReviews(productId: string): Promise<Review[]> {
  const all = [...loadUserReviews(), ...(db.reviews as Review[])]
  return all
    .filter((review) => review.productId === productId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function addReview(input: NewReview): Promise<Review> {
  const review: Review = {
    ...input,
    id: `u-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([review, ...loadUserReviews()]))
  } catch {
    // stocarea poate fi indisponibilă – recenzia apare doar până la refresh
  }
  return review
}
