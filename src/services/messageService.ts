import { addDoc, collection } from 'firebase/firestore'
import { db } from '../lib/firebase'

export interface ContactMessage {
  name: string
  email: string
  subject: string
  message: string
}

/** Salvează mesajul din formularul de contact în colecția "messages". */
export async function sendMessage(message: ContactMessage): Promise<void> {
  await addDoc(collection(db, 'messages'), { ...message, createdAt: new Date().toISOString() })
}
