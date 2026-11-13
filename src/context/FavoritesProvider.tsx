import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { addFavorites, getFavoriteIds, removeFavorite } from '../services/favoritesService'
import { useAuth } from './authContext'
import { FavoritesContext, type FavoritesContextValue } from './favoritesContext'

// Vizitatorii fără cont: favoritele stau în browser (localStorage).
// Utilizatorii autentificați: favoritele stau în Firestore, în users/{uid}.favoriteIds.
// La autentificare, favoritele salvate ca vizitator se mută în cont.
const STORAGE_KEY = 'favorites'

function loadLocal(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = saved ? JSON.parse(saved) : []
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

function saveLocal(ids: string[]) {
  try {
    if (ids.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // stocarea poate fi indisponibilă – favoritele rămân doar în memorie
  }
}

export default function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth()
  const uid = user?.uid
  // Favoritele vizitatorului (browser)
  const [localIds, setLocalIds] = useState<string[]>(loadLocal)
  // Favoritele din cont, memorate împreună cu uid-ul căruia îi aparțin
  const [accountFavorites, setAccountFavorites] = useState<{ uid: string; ids: string[] } | null>(null)

  // La autentificare: citește favoritele din cont și mută acolo pe cele locale
  useEffect(() => {
    if (initializing || !uid) return
    let active = true
    const local = loadLocal()
    getFavoriteIds(uid)
      .then(async (remote) => {
        const missing = local.filter((id) => !remote.includes(id))
        if (missing.length) await addFavorites(uid, missing)
        saveLocal([])
        if (!active) return
        setLocalIds([])
        setAccountFavorites({ uid, ids: [...remote, ...missing] })
      })
      .catch(() => {
        // la eroare de rețea afișăm măcar favoritele locale
        if (active) setAccountFavorites({ uid, ids: local })
      })
    return () => {
      active = false
    }
  }, [uid, initializing])

  const favoriteIds = useMemo(
    () => (uid ? (accountFavorites?.uid === uid ? accountFavorites.ids : []) : localIds),
    [uid, accountFavorites, localIds],
  )

  const toggleFavorite = useCallback(
    (productId: string) => {
      const previous = favoriteIds
      const removing = previous.includes(productId)
      const next = removing ? previous.filter((id) => id !== productId) : [...previous, productId]

      if (uid) {
        setAccountFavorites({ uid, ids: next }) // actualizare imediată în interfață
        const request = removing ? removeFavorite(uid, productId) : addFavorites(uid, [productId])
        // Dacă salvarea în cont eșuează, revenim la starea anterioară
        request.catch(() => setAccountFavorites({ uid, ids: previous }))
      } else {
        setLocalIds(next)
        saveLocal(next)
      }
    },
    [uid, favoriteIds],
  )

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
