import { useCallback, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import type { Product } from '../types/product'
import type { CartContextValue, CartItem } from '../types/cart'
import { CartContext } from './cartContext'

// Versiunea din cheie se schimbă când se schimbă catalogul, ca să nu rămână în coș produse vechi.
const STORAGE_KEY = 'cart-v2'

type CartAction =
  | { type: 'add'; product: Product; quantity: number }
  | { type: 'remove'; productId: string }
  | { type: 'setQuantity'; productId: string; quantity: number }
  | { type: 'clear' }

function cartReducer(items: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'add': {
      const existing = items.find((item) => item.product.id === action.product.id)
      const current = existing?.quantity ?? 0
      const next = Math.min(current + Math.max(1, action.quantity), action.product.stock)
      if (next <= current) return items
      if (!existing) return [...items, { product: action.product, quantity: next }]
      return items.map((item) => (item.product.id === action.product.id ? { ...item, quantity: next } : item))
    }
    case 'remove':
      return items.filter((item) => item.product.id !== action.productId)
    case 'setQuantity':
      if (action.quantity <= 0) {
        return items.filter((item) => item.product.id !== action.productId)
      }
      return items.map((item) =>
        item.product.id === action.productId
          ? { ...item, quantity: Math.min(action.quantity, item.product.stock) }
          : item,
      )
    case 'clear':
      return []
  }
}

function loadCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? (JSON.parse(saved) as CartItem[]) : []
  } catch {
    return []
  }
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, [], loadCart)
  const [isOpen, setIsOpen] = useState(false)

  // Coșul se păstrează în localStorage; mai târziu îl putem salva în Firestore per utilizator.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // stocarea poate fi indisponibilă (ex. mod privat) – coșul rămâne doar în memorie
    }
  }, [items])

  const getQuantity = useCallback(
    (productId: string) => items.find((item) => item.product.id === productId)?.quantity ?? 0,
    [items],
  )

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: items.reduce((sum, item) => sum + item.quantity * item.product.price, 0),
      isOpen,
      addItem: (product, quantity = 1) => dispatch({ type: 'add', product, quantity }),
      removeItem: (productId) => dispatch({ type: 'remove', productId }),
      updateQuantity: (productId, quantity) => dispatch({ type: 'setQuantity', productId, quantity }),
      getQuantity,
      clearCart: () => dispatch({ type: 'clear' }),
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }),
    [items, isOpen, getQuantity],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
