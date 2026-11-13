import { createContext, useContext } from 'react'
import type { User } from '../types/user'

export interface AuthContextValue {
  user: User | null
  /** true până când Firebase confirmă dacă există o sesiune activă */
  initializing: boolean
  /** utilizatorul curent are rol de admin (documentul admins/{uid} există) */
  isAdmin: boolean
  /** true cât timp se verifică rolul de admin al utilizatorului curent */
  checkingAdmin: boolean
  login: (email: string, password: string) => Promise<User>
  loginWithGoogle: () => Promise<User>
  register: (displayName: string, email: string, password: string) => Promise<User>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth trebuie folosit în interiorul <AuthProvider>')
  }
  return context
}
