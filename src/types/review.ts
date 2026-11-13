// Structura unui document din colecția "reviews" (Firestore).
export interface Review {
  id: string
  productId: string
  /** uid-ul autorului; lipsește la recenziile de test importate */
  userId?: string
  author: string
  rating: number
  comment: string
  createdAt: string
}

export type NewReview = Pick<Review, 'productId' | 'userId' | 'author' | 'rating' | 'comment'>
