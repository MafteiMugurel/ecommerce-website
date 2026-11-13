/*
 * Actualizează în Firestore doar pozele produselor (imageUrl + imageCredit),
 * pe baza valorilor din scripts/data/db.json. Restul câmpurilor (preț, stoc etc.) nu se ating.
 *
 * Rulare (cu un cont de admin – regulile permit doar adminilor să modifice produse):
 *   npm run update-images -- <email-admin> <parolă-admin>
 */
import { readFileSync } from 'node:fs'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { deleteField, doc, getFirestore, terminate, writeBatch } from 'firebase/firestore'

const [email, password] = process.argv.slice(2)
if (!email || !password) {
  console.error('Folosire: npm run update-images -- <email-admin> <parolă-admin>')
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
const { products } = JSON.parse(readFileSync(new URL('./data/db.json', import.meta.url), 'utf8'))

try {
  await signInWithEmailAndPassword(auth, email, password)
  const batch = writeBatch(db)
  for (const product of products) {
    batch.update(doc(db, 'products', product.id), {
      imageUrl: product.imageUrl,
      imageCredit: product.imageCredit ?? deleteField(),
    })
  }
  await batch.commit()
  const external = products.filter((p) => p.imageCredit).length
  console.log(`✓ ${products.length} produse actualizate: ${external} cu poză externă, ${products.length - external} cu ilustrația categoriei`)
  await signOut(auth)
} catch (error) {
  console.error('Eroare:', error.code ?? '', error.message)
  if (error.code === 'permission-denied') {
    console.error('→ Contul nu este admin (lipsește documentul admins/<uid>) sau regulile nu sunt publicate.')
  }
  process.exitCode = 1
} finally {
  await terminate(db)
}
