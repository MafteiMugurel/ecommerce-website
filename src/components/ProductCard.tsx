import { Link } from 'react-router'
import { useCart } from '../context/cartContext'
import { useFavorites } from '../context/favoritesContext'
import type { Product } from '../types/product'
import { formatPrice } from '../utils/format'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, getQuantity } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(product.id)
  const productUrl = `/produs/${product.id}`
  const inCart = getQuantity(product.id)
  const inStock = product.stock > 0
  const limitReached = inStock && inCart >= product.stock

  let buttonLabel = 'Adaugă în coș'
  if (!inStock) buttonLabel = 'Stoc epuizat'
  else if (limitReached) buttonLabel = 'Stoc maxim în coș'

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link to={productUrl} tabIndex={-1} aria-hidden="true">
          <img
            src={product.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </Link>
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700">
          {product.category}
        </span>
        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-pressed={favorite}
          aria-label={favorite ? 'Elimină de la favorite' : 'Adaugă la favorite'}
          title={favorite ? 'Elimină de la favorite' : 'Adaugă la favorite'}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110"
        >
          <svg
            className={`h-5 w-5 ${favorite ? 'fill-red-500 text-red-500' : 'fill-none text-gray-600'}`}
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
        </button>
        {inCart > 0 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white">
            {inCart} în coș
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">{product.brand}</span>
        <h2 className="text-base font-semibold text-gray-900">
          <Link to={productUrl} className="hover:text-indigo-600">
            {product.name}
          </Link>
        </h2>
        <p className="line-clamp-2 text-sm text-gray-600">{product.description}</p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price, product.currency)}
          </span>
          <span className="text-sm text-amber-500" aria-label={`Rating ${product.rating} din 5`}>
            ★ {product.rating.toFixed(1)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => addItem(product)}
          disabled={!inStock || limitReached}
          className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {buttonLabel}
        </button>
      </div>
    </article>
  )
}
