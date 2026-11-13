/*
 * Date demo pentru prezentare / statistici:
 *  - 30 de clienți fictivi: conturi în Firebase Authentication (emailuri @example.com, domeniu rezervat),
 *    profil în `users` (cu dată de înregistrare în trecut) și câteva produse favorite;
 *  - peste 200 de comenzi pe ultimele 90 de zile, cu adresă de livrare, metodă de plată și status
 *    în funcție de vechime (~75% de la clienți cu cont, restul de la vizitatori).
 *
 * Rulare:
 *   npm run seed-demo -- <email-admin> <parolă-admin> <parolă-clienți>
 *
 * <parolă-clienți> devine parola tuturor conturilor fictive (min. 6 caractere) – nu se salvează în cod.
 * Scriptul e idempotent: conturile existente sunt refolosite, iar comenzile au id-uri fixe
 * (demo-0001…), deci o rulare repetată le rescrie fără duplicate (datele se recalculează față de azi).
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
import { doc, getFirestore, setDoc, terminate, writeBatch } from 'firebase/firestore'

const [adminEmail, adminPassword, customerPassword] = process.argv.slice(2)
if (!adminEmail || !adminPassword || !customerPassword || customerPassword.length < 6) {
  console.error('Folosire: npm run seed-demo -- <email-admin> <parolă-admin> <parolă-clienți (min. 6 caractere)>')
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

// ---- generator pseudo-aleator determinist (aceleași date la fiecare rulare) ----
let seed = 20261113
const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648
const randInt = (min, max) => min + Math.floor(rand() * (max - min + 1))
const pick = (list) => list[Math.floor(rand() * list.length)]
function weighted(entries) {
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let r = rand() * total
  for (const [value, w] of entries) if ((r -= w) < 0) return value
  return entries[0][0]
}

// ---- date fictive ----
const FIRST = ['Andrei', 'Ioana', 'Mihai', 'Elena', 'Alexandru', 'Maria', 'Cristian', 'Ana', 'Bogdan', 'Diana', 'Radu',
  'Simona', 'Vlad', 'Larisa', 'George', 'Raluca', 'Ștefan', 'Irina', 'Florin', 'Oana', 'Adrian', 'Bianca', 'Daniel',
  'Corina', 'Sorin', 'Alina', 'Paul', 'Monica', 'Tudor', 'Gabriela']
const LAST = ['Popescu', 'Ionescu', 'Popa', 'Dumitrescu', 'Stan', 'Stoica', 'Gheorghe', 'Matei', 'Ciobanu', 'Rusu',
  'Munteanu', 'Constantin', 'Marin', 'Tudor', 'Dobre', 'Barbu', 'Nistor', 'Florea', 'Ene', 'Dinu', 'Lazăr', 'Toma',
  'Moldovan', 'Sima', 'Oprea', 'Neagu', 'Voicu', 'Preda', 'Mocanu', 'Radu']
// [județ, localitate, pondere] – orașele mari primesc mai multe comenzi
const LOCATIONS = [
  ['București', 'București', 22], ['Cluj', 'Cluj-Napoca', 10], ['Timiș', 'Timișoara', 8], ['Iași', 'Iași', 8],
  ['Constanța', 'Constanța', 6], ['Brașov', 'Brașov', 6], ['Ilfov', 'Voluntari', 5], ['Dolj', 'Craiova', 5],
  ['Galați', 'Galați', 4], ['Prahova', 'Ploiești', 4], ['Bihor', 'Oradea', 4], ['Sibiu', 'Sibiu', 4],
  ['Argeș', 'Pitești', 3], ['Arad', 'Arad', 3], ['Bacău', 'Bacău', 3], ['Mureș', 'Târgu Mureș', 3],
  ['Suceava', 'Suceava', 2], ['Maramureș', 'Baia Mare', 2], ['Buzău', 'Buzău', 2], ['Hunedoara', 'Deva', 2],
  ['Alba', 'Alba Iulia', 2], ['Neamț', 'Piatra Neamț', 1], ['Vâlcea', 'Râmnicu Vâlcea', 1], ['Satu Mare', 'Satu Mare', 1],
  ['Brăila', 'Brăila', 1], ['Tulcea', 'Tulcea', 1], ['Covasna', 'Sfântu Gheorghe', 1], ['Vaslui', 'Vaslui', 1],
]
const STREETS = ['Str. Mihai Eminescu', 'Bd. Unirii', 'Str. Republicii', 'Calea Victoriei', 'Str. Avram Iancu',
  'Bd. Independenței', 'Str. Libertății', 'Str. Florilor', 'Aleea Teilor', 'Str. Ștefan cel Mare', 'Bd. Carol I',
  'Str. Mihai Viteazu', 'Str. Primăverii', 'Calea București', 'Str. Lalelelor']
const PAYMENT_WEIGHTS = [['card', 40], ['cash_on_delivery', 30], ['card_on_delivery', 20], ['bank_transfer', 10]]

const ascii = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
const phone = () => `07${randInt(20, 89)}${String(randInt(0, 999999)).padStart(6, '0')}`
function makeAddress() {
  const location = weighted(LOCATIONS.map(([county, city, w]) => [[county, city], w]))
  const block = rand() < 0.5 ? `, bl. ${randInt(1, 40)}, ap. ${randInt(1, 80)}` : ''
  return { county: location[0], city: location[1], address: `${pick(STREETS)} nr. ${randInt(1, 150)}${block}` }
}

const DAY_MS = 86_400_000
const now = Date.now()

// Popularitate: produsele ieftine și cele din periferice/gaming se vând mai des
const inStock = products.filter((p) => p.stock > 0)
const productWeights = inStock.map((p) => [p, (p.price < 500 ? 5 : p.price < 1500 ? 3 : p.price < 5000 ? 1.5 : 0.3) *
  (['Periferice', 'Gaming', 'Stocare', 'Audio'].includes(p.category) ? 1.6 : 1)])

function makeItems() {
  const chosen = new Map()
  const count = weighted([[1, 55], [2, 30], [3, 15]])
  while (chosen.size < count) {
    const p = weighted(productWeights)
    chosen.set(p.id, p)
  }
  return [...chosen.values()].map((p) => ({
    productId: p.id,
    name: p.name,
    imageUrl: p.imageUrl,
    price: p.price,
    currency: p.currency,
    quantity: p.price < 300 ? randInt(1, 3) : p.price < 2000 ? weighted([[1, 80], [2, 20]]) : 1,
  }))
}

function statusFor(daysAgo) {
  if (rand() < 0.05) return 'cancelled'
  if (daysAgo <= 1) return rand() < 0.6 ? 'placed' : 'processing'
  if (daysAgo <= 4) return rand() < 0.5 ? 'processing' : 'shipped'
  if (daysAgo <= 7) return rand() < 0.3 ? 'shipped' : 'delivered'
  return 'delivered'
}

try {
  // ---- 1) clienți fictivi ----
  const customers = []
  for (let i = 0; i < 30; i++) {
    const first = FIRST[i]
    const last = LAST[(i * 7) % LAST.length]
    const name = `${first} ${last}`
    const email = `${ascii(first)}.${ascii(last)}@example.com`
    let user
    try {
      ;({ user } = await createUserWithEmailAndPassword(auth, email, customerPassword))
    } catch (error) {
      if (error.code !== 'auth/email-already-in-use') throw error
      ;({ user } = await signInWithEmailAndPassword(auth, email, customerPassword))
    }
    await updateProfile(user, { displayName: name })
    const address = makeAddress()
    const registeredDaysAgo = randInt(5, 180)
    const favoriteIds = [...new Set(Array.from({ length: randInt(0, 5) }, () => weighted(productWeights).id))]
    // scris autentificat ca acel client (regulile permit doar proprietarului)
    await setDoc(doc(db, 'users', user.uid), {
      displayName: name,
      email,
      createdAt: new Date(now - registeredDaysAgo * DAY_MS).toISOString(),
      favoriteIds,
    })
    customers.push({ uid: user.uid, name, email, phone: phone(), ...address, registeredDaysAgo })
    await signOut(auth)
    process.stdout.write(`\r✓ clienți: ${i + 1}/30`)
  }
  console.log()

  // ---- 2) comenzi, scrise ca admin ----
  await signInWithEmailAndPassword(auth, adminEmail, adminPassword)
  const orders = []
  for (let daysAgo = 89; daysAgo >= 0; daysAgo--) {
    const weekday = new Date(now - daysAgo * DAY_MS).getDay()
    // ușoară creștere în timp + vârf în weekend
    const perDay = randInt(1, 3) + (weekday === 0 || weekday === 6 ? 1 : 0) + (daysAgo < 30 && rand() < 0.4 ? 1 : 0)
    for (let k = 0; k < perDay; k++) {
      const eligible = customers.filter((c) => c.registeredDaysAgo >= daysAgo)
      const fromCustomer = eligible.length > 0 && rand() < 0.75
      const customer = fromCustomer ? pick(eligible) : null
      const guestName = `${pick(FIRST)} ${pick(LAST)}`
      const shipping = customer
        ? { name: customer.name, phone: customer.phone, email: customer.email, county: customer.county, city: customer.city, address: customer.address }
        : { name: guestName, phone: phone(), email: `${ascii(guestName).replace(' ', '.')}@example.com`, ...makeAddress() }
      const items = makeItems()
      orders.push({
        id: `demo-${String(orders.length + 1).padStart(4, '0')}`,
        data: {
          userId: customer?.uid ?? null,
          items,
          totalItems: items.reduce((s, i) => s + i.quantity, 0),
          totalPrice: Math.round(items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100,
          status: statusFor(daysAgo),
          shipping,
          paymentMethod: weighted(PAYMENT_WEIGHTS),
          createdAt: new Date(now - daysAgo * DAY_MS - randInt(0, 12) * 3600_000 - randInt(0, 59) * 60_000).toISOString(),
        },
      })
    }
  }

  for (let start = 0; start < orders.length; start += 400) {
    const batch = writeBatch(db)
    for (const { id, data } of orders.slice(start, start + 400)) batch.set(doc(db, 'orders', id), data)
    await batch.commit()
  }
  await signOut(auth)

  const revenue = orders.filter((o) => o.data.status !== 'cancelled').reduce((s, o) => s + o.data.totalPrice, 0)
  const withAccount = orders.filter((o) => o.data.userId).length
  console.log(`✓ ${orders.length} comenzi (${withAccount} de la clienți cu cont), venituri ${Math.round(revenue).toLocaleString('ro-RO')} lei`)
  console.log(`  Conturile fictive: prenume.nume@example.com, parola dată la rulare.`)
} catch (error) {
  console.error('\nEroare:', error.code ?? '', error.message)
  if (error.code === 'permission-denied') {
    console.error('→ Verifică: regulile din firestore.rules sunt publicate și contul admin are documentul admins/<uid>.')
  }
  process.exitCode = 1
} finally {
  await terminate(db)
}
