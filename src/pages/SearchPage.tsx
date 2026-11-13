import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import ProductGrid from '../components/ProductGrid'
import { useProducts } from '../hooks/useProducts'
import { searchProducts } from '../utils/search'

export default function SearchPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const query = (searchParams.get('q') ?? '').trim()
  const { products, loading, error } = useProducts()
  const results = useMemo(() => searchProducts(products, query), [products, query])

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {query ? t('search.resultsFor', { query }) : t('search.title')}
        </h1>
        {!loading && !error && query && <span className="shrink-0 text-sm text-gray-500">{t('common.products', { count: results.length })}</span>}
      </div>

      {!query && <p className="text-gray-500">{t('search.hint')}</p>}
      {query && loading && <p className="text-gray-500">{t('search.searching')}</p>}
      {error && <p className="text-red-600 dark:text-red-400">{t('products.loadError')}</p>}
      {query && !loading && !error && results.length === 0 && (
        <p className="text-gray-500">{t('search.noResults')}</p>
      )}
      {!loading && !error && results.length > 0 && <ProductGrid products={results} />}
    </section>
  )
}
