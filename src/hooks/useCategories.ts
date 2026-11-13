import { useEffect, useState } from 'react'
import { getCategories } from '../services/categoryService'
import type { Category } from '../types/category'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }, [])

  return { categories, loading }
}
