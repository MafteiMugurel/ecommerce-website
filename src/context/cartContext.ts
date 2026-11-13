import { createContext, useContext } from 'react'
import type { CartContextValue } from '../types/cart'

export const CartContext = createContext<CartContextValue | null>(null)

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart trebuie folosit în interiorul <CartProvider>')
  }
  return context
}
