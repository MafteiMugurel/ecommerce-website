import { FirebaseError } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import i18n from '../i18n'
import { auth, db } from '../lib/firebase'
import type { User } from '../types/user'

export const MIN_PASSWORD_LENGTH = 6

export function toAppUser(user: FirebaseUser, displayName?: string): User {
  return {
    uid: user.uid,
    displayName: displayName ?? user.displayName ?? user.email?.split('@')[0] ?? 'Utilizator',
    email: user.email ?? '',
    createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime).toISOString() : '',
  }
}

/** Ascultă schimbările de sesiune (login, logout, refresh). Returnează funcția de dezabonare. */
export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, (user) => callback(user ? toAppUser(user) : null))
}

export async function signUp(displayName: string, email: string, password: string): Promise<User> {
  const name = displayName.trim()
  const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password)
  await updateProfile(user, { displayName: name })
  // Profil în Firestore, util mai târziu (adrese, comenzi, favorite)
  await setDoc(doc(db, 'users', user.uid), {
    displayName: name,
    email: user.email,
    createdAt: new Date().toISOString(),
  })
  return toAppUser(user, name)
}

/**
 * Autentificare cu contul Google (fereastră pop-up).
 * La prima logare se creează și profilul din users/{uid}.
 */
export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  const { user } = await signInWithPopup(auth, provider)

  const profileRef = doc(db, 'users', user.uid)
  if (!(await getDoc(profileRef)).exists()) {
    await setDoc(profileRef, {
      displayName: user.displayName ?? user.email?.split('@')[0] ?? 'Utilizator',
      email: user.email,
      createdAt: new Date().toISOString(),
    })
  }
  return toAppUser(user)
}

export async function signIn(email: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(auth, email.trim(), password)
  return toAppUser(user)
}

export function signOut(): Promise<void> {
  return firebaseSignOut(auth)
}

/** Utilizatorul a închis singur fereastra Google – nu e o eroare de afișat. */
export function isPopupCancelled(error: unknown) {
  return (
    error instanceof FirebaseError &&
    (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request')
  )
}

export function getAuthErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/invalid-email':
        return i18n.t('auth.errors.invalidEmail')
      case 'auth/weak-password':
        return i18n.t('auth.errors.weakPassword', { count: MIN_PASSWORD_LENGTH })
      case 'auth/email-already-in-use':
        return i18n.t('auth.errors.emailInUse')
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return i18n.t('auth.errors.invalidCredential')
      case 'auth/too-many-requests':
        return i18n.t('auth.errors.tooManyRequests')
      case 'auth/network-request-failed':
        return i18n.t('auth.errors.network')
      case 'auth/operation-not-allowed':
        return i18n.t('auth.errors.notAllowed')
      case 'auth/popup-blocked':
        return i18n.t('auth.errors.popupBlocked')
      case 'auth/account-exists-with-different-credential':
        return i18n.t('auth.errors.differentCredential')
      case 'auth/unauthorized-domain':
        return i18n.t('auth.errors.unauthorizedDomain')
    }
  }
  return i18n.t('auth.errors.generic')
}
