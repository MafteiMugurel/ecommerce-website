import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import OrderShippingSummary from '../components/OrderShippingSummary'
import OrderStatusBadge from '../components/OrderStatusBadge'
import ProductImage from '../components/ProductImage'
import { useAuth } from '../context/authContext'
import { getUserOrders } from '../services/orderService'
import type { Order } from '../types/order'
import { formatDate, formatPrice } from '../utils/format'

export default function OrdersPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const uid = user?.uid
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!uid) return
    let active = true
    getUserOrders(uid)
      .then((result) => {
        if (active) setOrders(result)
      })
      .catch(() => {
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [uid])

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t('orders.title')}</h1>

      {loading && <p className="mt-6 text-gray-500">{t('orders.loading')}</p>}
      {error && <p className="mt-6 text-red-600 dark:text-red-400">{t('orders.loadError')}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-surface px-6 py-16 text-center">
          <p className="text-gray-600">{t('orders.empty')}</p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {t('common.seeProducts')}
          </Link>
        </div>
      )}

      <ul className="mt-6 space-y-4">
        {orders.map((order) => {
          const isOpen = expanded === order.id
          return (
            <li key={order.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-surface">
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : order.id)}
                aria-expanded={isOpen}
                className="flex w-full flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 text-left hover:bg-gray-50"
              >
                <div className="min-w-40 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{t('orders.orderNumber', { id: order.id.slice(0, 8).toUpperCase() })}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.createdAt, true)}</p>
                </div>
                <OrderStatusBadge status={order.status} />
                <span className="text-sm text-gray-600">{t('common.products', { count: order.totalItems })}</span>
                <span className="text-sm font-semibold text-gray-900">{formatPrice(order.totalPrice)}</span>
                <span className={`text-gray-400 transition ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true">
                  ▾
                </span>
              </button>

              {isOpen && (order.shipping || order.paymentMethod) && (
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                  <OrderShippingSummary order={order} />
                </div>
              )}
              {isOpen && (
                <ul className="divide-y divide-gray-100 border-t border-gray-100 px-5">
                  {order.items.map((item) => (
                    <li key={item.productId} className="flex items-center gap-4 py-3">
                      <ProductImage src={item.imageUrl} className="h-12 w-12 shrink-0 rounded-lg bg-gray-100 object-contain" />
                      <div className="flex-1">
                        <Link
                          to={`/produs/${item.productId}`}
                          className="text-sm font-medium text-gray-900 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {item.quantity} × {formatPrice(item.price, item.currency)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity, item.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
