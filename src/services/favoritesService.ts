import { arrayRemove, arrayUnion, doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

// Favoritele utilizatorului autentificat se păstrează în users/{uid}.favoriteIds.

export async function getFavoriteIds(uid: string): Promise<string[]> {
  const snapshot = await getDoc(doc(db, 'users', uid))
  const ids: unknown = snapshot.data()?.favoriteIds
  return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : []
}

export async function addFavorites(uid: string, productIds: string[]): Promise<void> {
  if (productIds.length === 0) return
  await setDoc(doc(db, 'users', uid), { favoriteIds: arrayUnion(...productIds) }, { merge: true })
}

export async function removeFavorite(uid: string, productId: string): Promise<void> {
  await setDoc(doc(db, 'users', uid), { favoriteIds: arrayRemove(productId) }, { merge: true })
}
