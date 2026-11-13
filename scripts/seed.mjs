/*
 * Importă datele inițiale (categorii, produse, recenzii) din scripts/data/db.json în Firestore.
 *
 * Rulare:  npm run seed
 *
 * Regulile finale din firestore.rules NU permit scrierea în catalog din aplicație.
 * Pentru import, publică temporar regulile din firestore.seed.rules, rulează scriptul,
 * apoi publică din nou firestore.rules.
 *
 * Scriptul e idempotent: documentele au id-uri fixe (p001, componente-pc, r0001...),
 * deci o rulare repetată suprascrie aceleași documente, fără duplicate.
 */
import { readFileSync } from 'node:fs'
import { initializeApp } from 'firebase/app'
import { doc, getFirestore, terminate, writeBatch } from 'firebase/firestore'

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
const db = getFirestore(app)

const data = JSON.parse(readFileSync(new URL('./data/db.json', import.meta.url), 'utf8'))

// Un batch Firestore acceptă maxim 500 de operații
const BATCH_SIZE = 400

async function importCollection(name, items) {
  for (let start = 0; start < items.length; start += BATCH_SIZE) {
    const batch = writeBatch(db)
    for (const { id, ...fields } of items.slice(start, start + BATCH_SIZE)) {
      batch.set(doc(db, name, id), fields)
    }
    await batch.commit()
  }
  console.log(`✓ ${name}: ${items.length} documente`)
}

try {
  console.log(`Import în proiectul ${env.VITE_FIREBASE_PROJECT_ID}...`)
  await importCollection('categories', data.categories)
  await importCollection('products', data.products)
  await importCollection('reviews', data.reviews)
  console.log('Gata. Nu uita să publici din nou regulile din firestore.rules.')
} catch (error) {
  console.error('\nImportul a eșuat:', error.code ?? '', error.message)
  if (error.code === 'permission-denied') {
    console.error('→ Publică temporar regulile din firestore.seed.rules în consola Firebase și rulează din nou.')
  }
  process.exitCode = 1
} finally {
  await terminate(db)
}
