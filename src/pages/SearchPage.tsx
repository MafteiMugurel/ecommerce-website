import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import ProductGrid from '../components/ProductGrid'
import { useProducts } from '../hooks/useProducts'
import { searchProducts } from '../utils/search'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = (searchParams.get('q') ?? '').trim()
  const { products, loading, error } = useProducts()
  const results = useMemo(() => searchProducts(products, query), [products, query])

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {query ? <>Rezultate pentru „{query}”</> : 'Căutare'}
        </h1>
        {!loading && !error && query && <span className="shrink-0 text-sm text-gray-500">{results.length} produse</span>}
      </div>

      {!query && <p className="text-gray-500">Scrie în bara de căutare ce produs cauți.</p>}
      {query && loading && <p className="text-gray-500">Se caută...</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
      {query && !loading && !error && results.length === 0 && (
        <p className="text-gray-500">Nu am găsit niciun produs. Încearcă alt termen sau verifică ortografia.</p>
      )}
      {!loading && !error && results.length > 0 && <ProductGrid products={results} />}
    </section>
  )
}
