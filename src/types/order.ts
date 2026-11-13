import type { CartItem } from './cart'

// Structura unei comenzi – viitor document în colecția "orders" (Firestore).
export interface Order {
  id: string
  items: CartItem[]
  totalItems: number
  totalPrice: number
  createdAt: string
}
