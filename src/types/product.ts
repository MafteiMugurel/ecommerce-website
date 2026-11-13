// O specificație tehnică (ex. { name: "Socket", value: "AM5" }).
// Listă, nu obiect, ca să se păstreze ordinea de afișare (map-urile din Firestore nu garantează ordinea).
export interface ProductSpec {
  name: string
  value: string
}

// Sursa și licența pozei, când imaginea vine de pe un site extern (ex. Wikimedia Commons).
// Licențele Creative Commons cer menționarea autorului și a licenței.
export interface ImageCredit {
  author: string
  license: string
  licenseUrl: string | null
  /** pagina imaginii pe site-ul sursă */
  sourceUrl: string
  /** numele site-ului sursă (ex. „Wikimedia Commons”) */
  sourceName: string
  /** true dacă poza nu arată exact modelul vândut (ex. alt model din aceeași familie) */
  representative?: boolean
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
  /** URL-ul pozei (extern sau ilustrația locală a categoriei) */
  imageUrl: string
  /** prezent doar pentru pozele externe care cer atribuire */
  imageCredit?: ImageCredit
  stock: number
  rating: number
  createdAt: string
}
