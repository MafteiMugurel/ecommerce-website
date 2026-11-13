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

/** Metodele de plată. „card” e simulat – aplicația nu procesează plăți reale. */
export const PAYMENT_METHODS = ['card', 'card_on_delivery', 'cash_on_delivery', 'bank_transfer'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

/** Adresa de livrare introdusă la finalizarea comenzii. */
export interface ShippingInfo {
  name: string
  phone: string
  email: string
  county: string
  city: string
  address: string
}

// Structura unui document din colecția "orders" (Firestore).
export interface Order {
  id: string
  /** uid-ul clientului; null pentru comenzile fără cont */
  userId: string | null
  items: OrderItem[]
  totalItems: number
  totalPrice: number
  status: OrderStatus
  /** lipsesc la comenzile create înainte de pasul de checkout */
  shipping?: ShippingInfo
  paymentMethod?: PaymentMethod
  createdAt: string
}
