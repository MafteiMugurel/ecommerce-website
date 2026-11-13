import { createContext, useContext } from 'react'

export interface FavoritesContextValue {
  favoriteIds: string[]
  count: number
  isFavorite: (productId: string) => boolean
  toggleFavorite: (productId: string) => void
}

export const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites trebuie folosit în interiorul <FavoritesProvider>')
  }
  return context
}
