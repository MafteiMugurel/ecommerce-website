/*
 * Date demo pentru prezentare:
 *  - favorite pentru un utilizator de test (scrise autentificat ca acel utilizator);
 *  - istoric de comenzi pentru utilizatorul de test + comenzi de la vizitatori,
 *    distribuite pe ultimele 90 de zile, ca dashboard-ul de admin să aibă statistici.
 *
 * Rulare:
 *   npm run seed-demo -- <email-admin> <parolă-admin> <email-test> <parolă-test>
 *
 * Comenzile se scriu autentificat ca admin (regulile permit doar adminilor să creeze
 * comenzi cu alt status decât "placed" sau cu date din trecut).
 * Scriptul e idempotent: comenzile demo au id-uri fixe (demo-0001...), deci o rulare
 * repetată le rescrie, fără duplicate (datele se recalculează față de ziua curentă).
 */
import { readFileSync } from 'node:fs'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getFirestore, setDoc, terminate, writeBatch } from 'firebase/firestore'

const [adminEmail, adminPassword, testEmail, testPassword] = process.argv.slice(2)
if (!adminEmail || !adminPassword || !testEmail || !testPassword) {
  console.error('Folosire: npm run seed-demo -- <email-admin> <parolă-admin> <email-test> <parolă-test>')
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
const inStock = products.filter((p) => p.stock > 0)

// Generator pseudo-aleator determinist (aceleași comenzi la fiecare rulare)
let seed = 2026
const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648
const randInt = (min, max) => min + Math.floor(rand() * (max - min + 1))
// Produsele ieftine se vând mai des: alegem de 3 ori și păstrăm cel mai ieftin, uneori
const pickProduct = () => {
  const a = inStock[randInt(0, inStock.length - 1)]
  if (rand() < 0.5) return a
  const b = inStock[randInt(0, inStock.length - 1)]
  return a.price < b.price ? a : b
}

const DAY_MS = 86_400_000
const now = Date.now()

function makeOrder(id, userId, daysAgo, status, productIds) {
  const chosen = productIds
    ? productIds.map((pid) => products.find((p) => p.id === pid))
    : Array.from({ length: randInt(1, 3) }, pickProduct)
  const unique = [...new Map(chosen.map((p) => [p.id, p])).values()]
  const items = unique.map((p) => ({
    productId: p.id,
    name: p.name,
    imageUrl: p.imageUrl,
    price: p.price,
    currency: p.currency,
    quantity: p.price < 300 ? randInt(1, 3) : randInt(1, 2) === 1 ? 1 : 2 - (p.price > 2000 ? 1 : 0),
  }))
  const created = new Date(now - daysAgo * DAY_MS - randInt(0, 10) * 3600_000)
  return {
    id,
    data: {
      userId,
      items,
      totalItems: items.reduce((s, i) => s + i.quantity, 0),
      totalPrice: Math.round(items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100,
      status,
      createdAt: created.toISOString(),
    },
  }
}

// Status realist în funcție de vechimea comenzii
function statusFor(daysAgo) {
  if (rand() < 0.05) return 'cancelled'
  if (daysAgo <= 1) return rand() < 0.6 ? 'placed' : 'processing'
  if (daysAgo <= 4) return rand() < 0.5 ? 'processing' : 'shipped'
  if (daysAgo <= 7) return rand() < 0.3 ? 'shipped' : 'delivered'
  return 'delivered'
}

try {
  // 1) Favorite pentru utilizatorul de test
  const { user: testUser } = await signInWithEmailAndPassword(auth, testEmail, testPassword)
  const favoriteIds = ['p001', 'p011', 'p043', 'p061', 'p087', 'p092']
  await setDoc(doc(db, 'users', testUser.uid), { favoriteIds }, { merge: true })
  console.log(`✓ ${favoriteIds.length} favorite pentru ${testEmail}`)
  await signOut(auth)

  // 2) Comenzi, scrise ca admin
  await signInWithEmailAndPassword(auth, adminEmail, adminPassword)
  const orders = [
    // Istoricul utilizatorului de test, de la cea mai nouă la cea mai veche
    makeOrder('demo-0001', testUser.uid, 0, 'placed', ['p008', 'p046']),
    makeOrder('demo-0002', testUser.uid, 3, 'shipped', ['p034']),
    makeOrder('demo-0003', testUser.uid, 12, 'delivered', ['p011']),
    makeOrder('demo-0004', testUser.uid, 27, 'delivered', ['p023', 'p094', 'p099']),
    makeOrder('demo-0005', testUser.uid, 45, 'cancelled', ['p063']),
    makeOrder('demo-0006', testUser.uid, 70, 'delivered', ['p001', 'p003', 'p031']),
  ]
  // Comenzi de la vizitatori: 1–3 pe zi, mai multe în weekend
  let n = orders.length
  for (let daysAgo = 0; daysAgo < 90; daysAgo++) {
    const weekday = new Date(now - daysAgo * DAY_MS).getDay()
    const perDay = randInt(0, 2) + (weekday === 0 || weekday === 6 ? 1 : 0)
    for (let i = 0; i < perDay; i++) {
      n++
      orders.push(makeOrder(`demo-${String(n).padStart(4, '0')}`, null, daysAgo, statusFor(daysAgo)))
    }
  }

  for (let start = 0; start < orders.length; start += 400) {
    const batch = writeBatch(db)
    for (const { id, data } of orders.slice(start, start + 400)) batch.set(doc(db, 'orders', id), data)
    await batch.commit()
  }
  const revenue = orders.filter((o) => o.data.status !== 'cancelled').reduce((s, o) => s + o.data.totalPrice, 0)
  console.log(`✓ ${orders.length} comenzi (6 pentru ${testEmail}), venituri totale ${Math.round(revenue)} lei`)
  await signOut(auth)
} catch (error) {
  console.error('Eroare:', error.code ?? '', error.message)
  if (error.code === 'permission-denied') {
    console.error('→ Verifică: regulile din firestore.rules sunt publicate și există documentul admins/<uid-admin>.')
  }
  process.exitCode = 1
} finally {
  await terminate(db)
}
