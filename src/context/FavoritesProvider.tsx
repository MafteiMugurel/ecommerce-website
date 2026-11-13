import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { FavoritesContext, type FavoritesContextValue } from './favoritesContext'

const STORAGE_KEY = 'favorites'

function loadFavorites(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = saved ? JSON.parse(saved) : []
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

// Favoritele se păstrează ca listă de id-uri de produse.
// Mai târziu: un document per utilizator în Firestore (ex. users/{uid}.favorites).
export default function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(loadFavorites)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds))
    } catch {
      // stocarea poate fi indisponibilă – favoritele rămân doar în memorie
    }
  }, [favoriteIds])

  const toggleFavorite = useCallback((productId: string) => {
    setFavoriteIds((ids) => (ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId]))
  }, [])

  const value = useMemo<FavoritesContextValue>(() => {
    const set = new Set(favoriteIds)
    return {
      favoriteIds,
      count: favoriteIds.length,
      isFavorite: (productId) => set.has(productId),
      toggleFavorite,
    }
  }, [favoriteIds, toggleFavorite])

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}
