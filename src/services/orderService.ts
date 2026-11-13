import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { CartItem } from '../types/cart'
import type { Order, OrderStatus, PaymentMethod, ShippingInfo } from '../types/order'

const ordersRef = collection(db, 'orders')

function newestFirst(a: Order, b: Order) {
  return b.createdAt.localeCompare(a.createdAt)
}

export async function placeOrder(
  items: CartItem[],
  userId: string | null,
  shipping: ShippingInfo,
  paymentMethod: PaymentMethod,
): Promise<Order> {
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
    shipping,
    paymentMethod,
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

/** O singură comandă (null dacă nu există) – doar pentru admini sau proprietarul comenzii. */
export async function getOrder(orderId: string): Promise<Order | null> {
  const snapshot = await getDoc(doc(db, 'orders', orderId))
  return snapshot.exists() ? { ...(snapshot.data() as Omit<Order, 'id'>), id: snapshot.id } : null
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
