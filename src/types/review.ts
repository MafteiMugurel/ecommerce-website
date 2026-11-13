// Structura unui document din colecția "reviews" (Firestore).
export interface Review {
  id: string
  productId: string
  author: string
  rating: number
  comment: string
  createdAt: string
}

export type NewReview = Pick<Review, 'productId' | 'author' | 'rating' | 'comment'>
