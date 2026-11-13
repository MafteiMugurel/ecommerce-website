// Structura unui document din colecția "categories" (Firestore).
// id = slug-ul folosit în URL (ex. /categorie/componente-pc)
export interface Category {
  id: string
  name: string
  order: number
}
