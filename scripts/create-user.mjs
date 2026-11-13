/*
 * Creează un utilizator (ex. cont de test) în Firebase Authentication
 * și profilul lui în colecția "users" din Firestore.
 *
 * Rulare:  npm run create-user -- <email> <parolă> "<Nume afișat>"
 *
 * Dacă emailul există deja, scriptul se autentifică cu parola dată
 * și doar actualizează numele și profilul.
 */
import { readFileSync } from 'node:fs'
import { initializeApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getFirestore, setDoc, terminate } from 'firebase/firestore'

const [email, password, displayName = 'Utilizator Test'] = process.argv.slice(2)
if (!email || !password) {
  console.error('Folosire: npm run create-user -- <email> <parolă> "<Nume afișat>"')
  process.exit(1)
}

function loadEnv(path) {
  const env = {}
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (match) env[match[1]] = match[2]
  }
  return env
}

const env = loadEnv(new URL('../.env', import.meta.url))
const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
})
const auth = getAuth(app)
const db = getFirestore(app)

try {
  let user
  let created = true
  try {
    ;({ user } = await createUserWithEmailAndPassword(auth, email, password))
  } catch (error) {
    if (error.code !== 'auth/email-already-in-use') throw error
    created = false
    ;({ user } = await signInWithEmailAndPassword(auth, email, password))
  }

  await updateProfile(user, { displayName })
  // Profilul se scrie autentificat ca utilizatorul însuși (permis de firestore.rules)
  await setDoc(
    doc(db, 'users', user.uid),
    { displayName, email: user.email, createdAt: new Date(user.metadata.creationTime).toISOString() },
    { merge: true },
  )

  console.log(`${created ? '✓ Cont creat' : '✓ Contul exista deja – profil actualizat'}`)
  console.log(`  uid:   ${user.uid}`)
  console.log(`  email: ${user.email}`)
  console.log(`  nume:  ${displayName}`)
  await signOut(auth)
} catch (error) {
  console.error('Eroare:', error.code ?? '', error.message)
  if (error.code === 'permission-denied') {
    console.error('→ Contul există în Authentication, dar profilul nu s-a putut salva. Publică regulile din firestore.rules și rulează din nou.')
  }
  process.exitCode = 1
} finally {
  await terminate(db)
}
