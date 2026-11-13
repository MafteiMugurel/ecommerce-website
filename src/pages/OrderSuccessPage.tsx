import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation } from 'react-router'
import OrderShippingSummary from '../components/OrderShippingSummary'
import ProductImage from '../components/ProductImage'
import type { Order } from '../types/order'
import { formatPrice } from '../utils/format'

export default function OrderSuccessPage() {
  const { t } = useTranslation()
  const order = (useLocation().state as { order?: Order } | null)?.order

  // Pagina are sens doar imediat după plasarea unei comenzi.
  if (!order) return <Navigate to="/" replace />

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-gray-200 bg-surface p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40 text-3xl text-green-600 dark:text-green-400">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t('orderSuccess.title')}</h1>
        <p className="mt-2 text-gray-600">
          {t('orderSuccess.text')}
        </p>
        <p className="mt-4 text-sm text-gray-500">
          {t('orderSuccess.number')} <span className="font-mono font-semibold text-gray-900">{order.id}</span>
        </p>

        <div className="mt-8 rounded-xl bg-gray-50 p-4">
          <OrderShippingSummary order={order} />
        </div>

        <ul className="mt-6 divide-y divide-gray-100 border-y border-gray-100 text-left">
          {order.items.map((item) => (
            <li key={item.productId} className="flex items-center gap-4 py-3">
              <ProductImage src={item.imageUrl} alt={item.name} className="h-14 w-14 shrink-0 rounded-lg bg-gray-100 object-contain" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">{t('orderSuccess.quantity', { count: item.quantity })}</p>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {formatPrice(item.price * item.quantity, item.currency)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between text-base font-semibold text-gray-900">
          <span>{t('orderSuccess.total', { count: order.totalItems })}</span>
          <span>{formatPrice(order.totalPrice)}</span>
        </div>

        <Link
          to="/"
          className="mt-8 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {t('common.backToProducts')}
        </Link>
      </div>
    </section>
  )
}
