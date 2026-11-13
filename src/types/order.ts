// Un produs din comandă: copie a datelor de la momentul comenzii
// (dacă prețul se schimbă ulterior, comanda își păstrează prețul plătit).
export interface OrderItem {
  productId: string
  name: string
  imageUrl: string
  price: number
  currency: string
  quantity: number
}

export const ORDER_STATUSES = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

// Structura unui document din colecția "orders" (Firestore).
export interface Order {
  id: string
  /** uid-ul clientului; null pentru comenzile fără cont */
  userId: string | null
  items: OrderItem[]
  totalItems: number
  totalPrice: number
  status: OrderStatus
  createdAt: string
}
