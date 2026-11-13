import { average, collection, count, doc, getAggregateFromServer, getCountFromServer, getDoc, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'

/** Un utilizator e admin dacă există documentul admins/{uid} (creat din consola Firebase). */
export async function checkIsAdmin(uid: string): Promise<boolean> {
  try {
    return (await getDoc(doc(db, 'admins', uid))).exists()
  } catch {
    return false
  }
}

export interface ContactMessageRecord {
  id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
}

export interface StoreCounts {
  users: number
  reviews: number
  averageRating: number
}

/** Numărători calculate pe server (nu descarcă documentele). */
export async function getStoreCounts(): Promise<StoreCounts> {
  const [users, reviews] = await Promise.all([
    getCountFromServer(collection(db, 'users')),
    getAggregateFromServer(collection(db, 'reviews'), { total: count(), averageRating: average('rating') }),
  ])
  return {
    users: users.data().count,
    reviews: reviews.data().total,
    averageRating: reviews.data().averageRating ?? 0,
  }
}

export async function getMessages(): Promise<ContactMessageRecord[]> {
  const snapshot = await getDocs(collection(db, 'messages'))
  return snapshot.docs
    .map((d) => ({ ...(d.data() as Omit<ContactMessageRecord, 'id'>), id: d.id }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
