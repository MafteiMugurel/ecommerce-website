import type { Product } from './product'

export interface CartItem {
  product: Product
  quantity: number
}

export interface CartContextValue {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  isOpen: boolean
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  getQuantity: (productId: string) => number
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
}
