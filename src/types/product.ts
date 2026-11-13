// O specificație tehnică (ex. { name: "Socket", value: "AM5" }).
// Listă, nu obiect, ca să se păstreze ordinea de afișare (map-urile din Firestore nu garantează ordinea).
export interface ProductSpec {
  name: string
  value: string
}

// Structura unui document din colecția "products" (Firestore).
export interface Product {
  id: string
  name: string
  brand: string
  description: string
  specs: ProductSpec[]
  price: number
  currency: string
  category: string
  imageUrl: string
  stock: number
  rating: number
  createdAt: string
}
