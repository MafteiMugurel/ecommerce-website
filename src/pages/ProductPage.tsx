import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import ProductGrid from '../components/ProductGrid'
import ProductImage from '../components/ProductImage'
import ProductSpecs from '../components/ProductSpecs'
import ReviewsSection from '../components/ReviewsSection'
import StarRating from '../components/StarRating'
import { useCart } from '../context/cartContext'
import { useFavorites } from '../context/favoritesContext'
import { useCategories } from '../hooks/useCategories'
import { useProducts } from '../hooks/useProducts'
import { useCategoryLabel } from '../i18n/useCategoryLabel'
import type { Product } from '../types/product'
import { formatPrice } from '../utils/format'
import { categoryImage } from '../utils/productImage'

const SIMILAR_COUNT = 4

/** Produse din aceeași categorie, cele mai apropiate ca preț de produsul curent. */
function getSimilarProducts(product: Product, products: Product[]) {
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .sort((a, b) => Math.abs(a.price - product.price) - Math.abs(b.price - product.price))
    .slice(0, SIMILAR_COUNT)
}

function StockStatus({ stock }: { stock: number }) {
  const { t } = useTranslation()
  if (stock === 0) return <span className="font-medium text-red-600 dark:text-red-400">{t('product.outOfStock')}</span>
  if (stock <= 5) return <span className="font-medium text-amber-600 dark:text-amber-400">{t('product.limitedStock', { count: stock })}</span>
  return <span className="font-medium text-green-600 dark:text-green-400">{t('product.inStock')}</span>
}

export default function ProductPage() {
  const { t } = useTranslation()
  const categoryLabel = useCategoryLabel()
  const { productId } = useParams()
  const { products, loading, error } = useProducts()
  const { categories } = useCategories()

  if (loading) {
    return <p className="mx-auto max-w-7xl px-4 py-8 text-gray-500 sm:px-6 lg:px-8">{t('product.loading')}</p>
  }
  if (error) {
    return <p className="mx-auto max-w-7xl px-4 py-8 text-red-600 dark:text-red-400 sm:px-6 lg:px-8">{t('products.loadError')}</p>
  }

  const product = products.find((p) => p.id === productId)
  if (!product) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('product.notFound')}</h1>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
          {t('common.seeAllProducts')}
        </Link>
      </section>
    )
  }

  const category = categories.find((c) => c.name === product.category)
  const similar = getSimilarProducts(product, products)

  return (
    <div className="mx-auto max-w-7xl space-y-14 px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="-mb-8 text-sm text-gray-500">
        <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">{t('product.breadcrumb')}</Link>
        {category && (
          <>
            <span className="mx-2">/</span>
            <Link to={`/categorie/${category.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">{categoryLabel(category.id)}</Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      {/* key = id produs, ca la trecerea pe alt produs să se reseteze cantitatea */}
      <ProductDetails key={product.id} product={product} />

      <ProductSpecs product={product} />

      {similar.length > 0 && (
        <section>
          <h2 className="mb-6 text-xl font-bold text-gray-900 sm:text-2xl">{t('product.similar')}</h2>
          <ProductGrid products={similar} />
        </section>
      )}

      <ReviewsSection key={`reviews-${product.id}`} productId={product.id} />
    </div>
  )
}

function ProductDetails({ product }: { product: Product }) {
  const { t } = useTranslation()
  const { addItem, getQuantity, openCart } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [quantity, setQuantity] = useState(1)

  const favorite = isFavorite(product.id)
  const inCart = getQuantity(product.id)
  const available = product.stock - inCart
  const canAdd = available > 0

  function handleAdd() {
    addItem(product, Math.min(quantity, available))
    setQuantity(1)
    openCart()
  }

  return (
    <section className="grid gap-8 md:grid-cols-2 lg:gap-12">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-surface">
        <ProductImage
          src={product.imageUrl}
          fallbackSrc={categoryImage(product.category)}
          alt={product.name}
          className="aspect-square w-full bg-gray-100 object-contain"
        />
        {/* Atribuirea cerută de licențele Creative Commons pentru pozele externe */}
        {product.imageCredit && (
          <p className="border-t border-gray-100 px-4 py-2 text-xs text-gray-500">
            {t('product.photoCredit')}{' '}
            <a href={product.imageCredit.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">
              {product.imageCredit.author || product.imageCredit.sourceName}
            </a>
            {', '}
            {product.imageCredit.licenseUrl ? (
              <a href={product.imageCredit.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">
                {product.imageCredit.license}
              </a>
            ) : (
              product.imageCredit.license
            )}
            {', '}
            {t('product.photoVia', { source: product.imageCredit.sourceName })}
            {product.imageCredit.representative && (
              <span className="mt-1 block italic">{t('product.representativeImage')}</span>
            )}
          </p>
        )}
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">{product.brand}</span>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>

        <a href="#recenzii" className="mt-3 flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 dark:hover:text-indigo-400">
          <StarRating rating={product.rating} />
          <span>{product.rating.toFixed(1)}</span>
          <span className="underline">{t('product.seeReviews')}</span>
        </a>

        <p className="mt-6 text-3xl font-bold text-gray-900">{formatPrice(product.price, product.currency)}</p>
        <p className="mt-1 text-sm">
          <StockStatus stock={product.stock} />
        </p>

        <p className="mt-6 leading-relaxed text-gray-700">{product.description}</p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {canAdd && (
            <div className="flex items-center rounded-lg border border-gray-300">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:text-gray-300"
                aria-label={t('product.decrease')}
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-medium">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(available, q + 1))}
                disabled={quantity >= available}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:text-gray-300"
                aria-label={t('product.increase')}
              >
                +
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className="flex-1 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:flex-none"
          >
            {product.stock === 0 ? t('product.outOfStock') : canAdd ? t('product.addToCart') : t('product.maxInCart')}
          </button>

          <button
            type="button"
            onClick={() => toggleFavorite(product.id)}
            aria-pressed={favorite}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
              favorite ? 'border-red-200 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg
              className={`h-5 w-5 ${favorite ? 'fill-red-500' : 'fill-none'}`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
            {favorite ? t('product.onFavorites') : t('product.addFavorite')}
          </button>
        </div>

        {inCart > 0 && <p className="mt-3 text-sm text-gray-500">{t('product.alreadyInCart', { count: inCart })}</p>}

        {/* Primele specificații, ca rezumat rapid */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <ul className="space-y-1.5 text-sm text-gray-700">
            {product.specs.slice(0, 4).map((spec) => (
              <li key={spec.name}>
                <span className="text-gray-500">{spec.name}:</span> {spec.value}
              </li>
            ))}
          </ul>
          <a href="#specificatii" className="mt-3 inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            {t('product.seeAllSpecs')}
          </a>
        </div>
      </div>
    </section>
  )
}
