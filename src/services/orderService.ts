import type { CartItem } from '../types/cart'
import type { Order } from '../types/order'

// Mock: comanda nu se salvează nicăieri încă.
// Când conectăm Firebase: addDoc(collection(firestore, 'orders'), order).

const MOCK_LATENCY_MS = 500

export async function placeOrder(items: CartItem[]): Promise<Order> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

  return {
    id: `CMD-${Date.now().toString(36).toUpperCase()}`,
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + item.quantity * item.product.price, 0),
    createdAt: new Date().toISOString(),
  }
}
