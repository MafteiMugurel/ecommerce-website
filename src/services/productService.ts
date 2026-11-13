import db from '../data/db.json'
import type { Product } from '../types/product'

// Mock pentru Firestore: datele vin din db.json.
// Când conectăm Firebase, doar implementarea de aici se schimbă
// (ex. getDocs(collection(firestore, 'products'))), restul aplicației rămâne la fel.

const MOCK_LATENCY_MS = 300

export async function getProducts(): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))
  return db.products as Product[]
}
