import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import ProductGrid from '../components/ProductGrid'
import { useFavorites } from '../context/favoritesContext'
import { useProducts } from '../hooks/useProducts'

export default function FavoritesPage() {
  const { t } = useTranslation()
  const { favoriteIds } = useFavorites()
  const { products, loading, error } = useProducts()
  // Ordinea: cele adăugate cel mai recent apar primele
  const favorites = [...favoriteIds]
    .reverse()
    .map((id) => products.find((product) => product.id === id))
    .filter((product) => product !== undefined)

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t('favorites.title')}</h1>
        {!loading && !error && favorites.length > 0 && (
          <span className="text-sm text-gray-500">{t('common.products', { count: favorites.length })}</span>
        )}
      </div>

      {loading && <p className="text-gray-500">{t('common.loading')}</p>}
      {error && <p className="text-red-600 dark:text-red-400">{t('products.loadError')}</p>}

      {!loading && !error && favorites.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-surface px-6 py-16 text-center">
          <p className="text-4xl text-gray-300">♡</p>
          <p className="mt-3 text-gray-600">{t('favorites.empty')}</p>
          <p className="text-sm text-gray-500">{t('favorites.emptyHint')}</p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {t('common.seeProducts')}
          </Link>
        </div>
      )}

      {!loading && !error && favorites.length > 0 && <ProductGrid products={favorites} />}
    </section>
  )
}
