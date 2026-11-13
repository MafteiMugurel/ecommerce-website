import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import AdminNav from '../components/admin/AdminNav'
import ProductImage from '../components/ProductImage'
import { useCategories } from '../hooks/useCategories'
import { useCategoryLabel } from '../i18n/useCategoryLabel'
import { getProducts, updateStock } from '../services/productService'
import type { Product } from '../types/product'
import { formatPrice } from '../utils/format'
import { categoryImage } from '../utils/productImage'
import { normalize } from '../utils/search'

const LOW_STOCK_LIMIT = 5

type RowState = { status: 'idle' } | { status: 'saving' } | { status: 'saved' } | { status: 'error' }

export default function AdminProductsPage() {
  const { t } = useTranslation()
  const categoryLabel = useCategoryLabel()
  const { categories } = useCategories()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  // Stocul editat (încă nesalvat), pe id de produs
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [rowState, setRowState] = useState<Record<string, RowState>>({})

  useEffect(() => {
    let active = true
    getProducts()
      .then((result) => {
        if (active) setProducts(result)
      })
      .catch(() => {
        if (active) setLoadError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const visible = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean)
    return products.filter((p) => {
      if (category && p.category !== category) return false
      if (lowStockOnly && p.stock > LOW_STOCK_LIMIT) return false
      const text = normalize(`${p.id} ${p.name} ${p.brand}`)
      return terms.every((term) => text.includes(term))
    })
  }, [products, query, category, lowStockOnly])

  function draftValue(product: Product) {
    return drafts[product.id] ?? String(product.stock)
  }

  function setDraft(productId: string, value: string) {
    setDrafts((current) => ({ ...current, [productId]: value }))
    setRowState((current) => ({ ...current, [productId]: { status: 'idle' } }))
  }

  function parseStock(value: string): number | null {
    if (!/^\d+$/.test(value.trim())) return null
    return Number(value)
  }

  async function saveStock(product: Product) {
    const stock = parseStock(draftValue(product))
    if (stock === null) {
      setRowState((current) => ({ ...current, [product.id]: { status: 'error' } }))
      return
    }
    setRowState((current) => ({ ...current, [product.id]: { status: 'saving' } }))
    try {
      await updateStock(product.id, stock)
      setProducts((current) => current.map((p) => (p.id === product.id ? { ...p, stock } : p)))
      setDrafts(({ [product.id]: _saved, ...rest }) => rest)
      setRowState((current) => ({ ...current, [product.id]: { status: 'saved' } }))
    } catch {
      setRowState((current) => ({ ...current, [product.id]: { status: 'error' } }))
    }
  }

  const inputClass =
    'rounded-lg border border-gray-300 bg-surface px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-3">
          <AdminNav />
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t('adminProducts.title')}</h1>
        </div>
        <Link
          to="/admin/produse/nou"
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + {t('adminProducts.add')}
        </Link>
      </div>

      {/* Filtre – un singur rând deasupra tabelului */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('adminProducts.search')}
          aria-label={t('adminProducts.search')}
          className={`${inputClass} w-full sm:w-72`}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label={t('adminProducts.colCategory')}
          className={inputClass}
        >
          <option value="">{t('adminProducts.allCategories')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {categoryLabel(c.id)}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 accent-indigo-600"
          />
          {t('adminProducts.lowStockOnly', { count: LOW_STOCK_LIMIT })}
        </label>
        {!loading && (
          <span className="ml-auto text-sm text-gray-500">
            {t('adminProducts.shown', { shown: visible.length, total: products.length })}
          </span>
        )}
      </div>

      {loading && <p className="text-gray-500">{t('products.loading')}</p>}
      {loadError && <p className="text-red-600 dark:text-red-400">{t('products.loadError')}</p>}

      {!loading && !loadError && (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-surface">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="px-4 py-3 font-medium">{t('adminProducts.colProduct')}</th>
                <th className="px-4 py-3 font-medium">{t('adminProducts.colCategory')}</th>
                <th className="px-4 py-3 text-right font-medium">{t('adminProducts.colPrice')}</th>
                <th className="px-4 py-3 font-medium">{t('adminProducts.colStock')}</th>
                <th className="px-4 py-3 text-right font-medium">{t('adminProducts.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map((product) => {
                const value = draftValue(product)
                const dirty = drafts[product.id] !== undefined && drafts[product.id] !== String(product.stock)
                const state = rowState[product.id]?.status ?? 'idle'
                const parsed = parseStock(value)
                return (
                  <tr key={product.id} className="align-middle">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage
                          src={product.imageUrl}
                          fallbackSrc={categoryImage(product.category)}
                          className="h-10 w-10 shrink-0 rounded-md bg-gray-100 object-contain"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{product.name}</p>
                          <p className="font-mono text-xs text-gray-500">
                            {product.id.toUpperCase()} · {product.brand}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{categoryLabel(product.category)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-900">
                      {formatPrice(product.price, product.currency)}
                    </td>
                    <td className="px-4 py-3">
                      {/* Editare rapidă a stocului: −/+ sau valoare scrisă, apoi Salvează (sau Enter) */}
                      <form
                        className="flex items-center gap-2"
                        onSubmit={(e) => {
                          e.preventDefault()
                          void saveStock(product)
                        }}
                      >
                        <div
                          className={`flex items-center rounded-lg border ${
                            parsed === null ? 'border-red-400' : 'border-gray-300'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setDraft(product.id, String(Math.max(0, (parsed ?? product.stock) - 1)))}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            aria-label={t('product.decrease')}
                          >
                            −
                          </button>
                          <input
                            inputMode="numeric"
                            value={value}
                            onChange={(e) => setDraft(product.id, e.target.value)}
                            aria-label={t('adminProducts.stockFor', { name: product.name })}
                            className={`w-14 bg-transparent py-1 text-center text-sm tabular-nums focus:outline-none ${
                              product.stock === 0 && !dirty
                                ? 'font-semibold text-red-600 dark:text-red-400'
                                : product.stock <= LOW_STOCK_LIMIT && !dirty
                                  ? 'font-semibold text-amber-600 dark:text-amber-400'
                                  : 'text-gray-900'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setDraft(product.id, String((parsed ?? product.stock) + 1))}
                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            aria-label={t('product.increase')}
                          >
                            +
                          </button>
                        </div>
                        {dirty && (
                          <button
                            type="submit"
                            disabled={state === 'saving' || parsed === null}
                            className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:bg-gray-300"
                          >
                            {state === 'saving' ? t('adminProducts.saving') : t('adminProducts.save')}
                          </button>
                        )}
                        {!dirty && state === 'saved' && (
                          <span className="text-xs text-green-600 dark:text-green-400">✓ {t('adminProducts.saved')}</span>
                        )}
                        {state === 'error' && (
                          <span className="text-xs text-red-600 dark:text-red-400" role="alert">
                            {t('adminProducts.stockSaveError')}
                          </span>
                        )}
                      </form>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3 whitespace-nowrap">
                        <Link
                          to={`/produs/${product.id}`}
                          className="text-gray-500 hover:text-gray-900 hover:underline"
                        >
                          {t('adminProducts.view')}
                        </Link>
                        <Link
                          to={`/admin/produse/${product.id}`}
                          className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          {t('adminProducts.edit')}
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {visible.length === 0 && <p className="px-4 py-8 text-center text-gray-500">{t('adminProducts.noResults')}</p>}
        </div>
      )}
    </div>
  )
}
