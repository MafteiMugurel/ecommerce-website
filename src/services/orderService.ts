import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { CartItem } from '../types/cart'
import type { Order, OrderStatus } from '../types/order'

const ordersRef = collection(db, 'orders')

function newestFirst(a: Order, b: Order) {
  return b.createdAt.localeCompare(a.createdAt)
}

export async function placeOrder(items: CartItem[], userId: string | null): Promise<Order> {
  const data: Omit<Order, 'id'> = {
    userId,
    items: items.map(({ product, quantity }) => ({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      currency: product.currency,
      quantity,
    })),
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + item.quantity * item.product.price, 0),
    status: 'placed',
    createdAt: new Date().toISOString(),
  }

  const ref = await addDoc(ordersRef, data)
  return { ...data, id: ref.id }
}

/** Comenzile unui client. Filtrul pe userId e obligatoriu – regulile nu permit altă interogare. */
export async function getUserOrders(userId: string): Promise<Order[]> {
  const snapshot = await getDocs(query(ordersRef, where('userId', '==', userId)))
  return snapshot.docs.map((d) => ({ ...(d.data() as Omit<Order, 'id'>), id: d.id })).sort(newestFirst)
}

/** Toate comenzile – doar pentru admini. */
export async function getAllOrders(): Promise<Order[]> {
  const snapshot = await getDocs(ordersRef)
  return snapshot.docs.map((d) => ({ ...(d.data() as Omit<Order, 'id'>), id: d.id })).sort(newestFirst)
}

/** Schimbă statusul unei comenzi – doar pentru admini. */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(db, 'orders', orderId), { status })
}
