import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { checkIsAdmin } from '../services/adminService'
import { signIn, signInWithGoogle, signOut, signUp, subscribeToAuth } from '../services/authService'
import type { User } from '../types/user'
import { AuthContext, type AuthContextValue } from './authContext'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // Firebase restaurează sesiunea asincron; până atunci nu știm dacă utilizatorul e logat
  const [initializing, setInitializing] = useState(true)
  // Rezultatul verificării de admin, memorat împreună cu uid-ul pentru care s-a făcut
  const [adminCheck, setAdminCheck] = useState<{ uid: string; isAdmin: boolean } | null>(null)

  useEffect(
    () =>
      subscribeToAuth((current) => {
        // La creare cont, Firebase anunță utilizatorul înainte de setarea numelui;
        // păstrăm numele deja cunoscut pentru același uid.
        setUser((previous) =>
          current && previous?.uid === current.uid ? { ...current, displayName: previous.displayName } : current,
        )
        setInitializing(false)
      }),
    [],
  )

  const uid = user?.uid
  useEffect(() => {
    if (!uid) return
    let active = true
    void checkIsAdmin(uid).then((isAdmin) => {
      if (active) setAdminCheck({ uid, isAdmin })
    })
    return () => {
      active = false
    }
  }, [uid])

  const isAdmin = Boolean(uid && adminCheck?.uid === uid && adminCheck.isAdmin)
  const checkingAdmin = Boolean(uid && adminCheck?.uid !== uid)

  const login = useCallback(async (email: string, password: string) => {
    const signedIn = await signIn(email, password)
    setUser(signedIn)
    return signedIn
  }, [])

  const loginWithGoogle = useCallback(async () => {
    const signedIn = await signInWithGoogle()
    setUser(signedIn)
    return signedIn
  }, [])

  const register = useCallback(async (displayName: string, email: string, password: string) => {
    const created = await signUp(displayName, email, password)
    setUser(created)
    return created
  }, [])

  const logout = useCallback(async () => {
    await signOut()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, initializing, isAdmin, checkingAdmin, login, loginWithGoogle, register, logout }),
    [user, initializing, isAdmin, checkingAdmin, login, loginWithGoogle, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
