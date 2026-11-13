import { useEffect, useState } from 'react'
import { getProducts } from '../services/productService'
import type { Product } from '../types/product'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setError('Nu am putut încărca produsele.'))
      .finally(() => setLoading(false))
  }, [])

  return { products, loading, error }
}
