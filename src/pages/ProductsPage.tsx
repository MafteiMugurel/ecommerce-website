import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { useCategoryLabel } from '../i18n/useCategoryLabel'
import ProductGrid from '../components/ProductGrid'
import { useCategories } from '../hooks/useCategories'
import { useProducts } from '../hooks/useProducts'

export default function ProductsPage() {
  const { t } = useTranslation()
  const categoryLabel = useCategoryLabel()
  const { categoryId } = useParams()
  const { categories, loading: categoriesLoading } = useCategories()
  const { products, loading, error } = useProducts()

  const category = categoryId ? categories.find((c) => c.id === categoryId) : undefined
  const visibleProducts = category ? products.filter((p) => p.category === category.name) : products
  const isLoading = loading || (categoryId !== undefined && categoriesLoading)

  if (categoryId && !categoriesLoading && !category) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('products.categoryNotFound')}</h1>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
          {t('common.seeAllProducts')}
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {category ? categoryLabel(category.id) : t('products.allProducts')}
        </h1>
        {!isLoading && !error && (
          <span className="text-sm text-gray-500">{t('common.products', { count: visibleProducts.length })}</span>
        )}
      </div>

      {isLoading && <p className="text-gray-500">{t('products.loading')}</p>}
      {error && <p className="text-red-600 dark:text-red-400">{t('products.loadError')}</p>}

      {!isLoading && !error && visibleProducts.length === 0 && (
        <p className="text-gray-500">{t('products.emptyCategory')}</p>
      )}

      {!isLoading && !error && visibleProducts.length > 0 && <ProductGrid products={visibleProducts} />}
    </section>
  )
}
