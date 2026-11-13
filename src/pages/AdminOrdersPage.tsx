import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import AdminNav from '../components/admin/AdminNav'
import OrderStatusBadge from '../components/OrderStatusBadge'
import { getAllOrders } from '../services/orderService'
import { ORDER_STATUSES, type Order, type OrderStatus } from '../types/order'
import { formatDate, formatPrice, shortOrderId } from '../utils/format'
import { normalize } from '../utils/search'

export default function AdminOrdersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<OrderStatus | ''>('')

  useEffect(() => {
    let active = true
    getAllOrders()
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
  }, [])

  const visible = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean)
    return orders.filter((o) => {
      if (status && o.status !== status) return false
      const text = normalize(
        `${o.id} ${o.shipping?.name ?? ''} ${o.shipping?.city ?? ''} ${o.shipping?.county ?? ''} ${o.shipping?.email ?? ''}`,
      )
      return terms.every((term) => text.includes(term))
    })
  }, [orders, query, status])

  const inputClass =
    'rounded-lg border border-gray-300 bg-surface px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <AdminNav />
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t('adminOrders.title')}</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('adminOrders.search')}
          aria-label={t('adminOrders.search')}
          className={`${inputClass} w-full sm:w-80`}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus | '')}
          aria-label={t('admin.status')}
          className={inputClass}
        >
          <option value="">{t('adminOrders.allStatuses')}</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`orderStatus.${s}`)}
            </option>
          ))}
        </select>
        {!loading && (
          <span className="ml-auto text-sm text-gray-500">
            {t('adminOrders.shown', { shown: visible.length, total: orders.length })}
          </span>
        )}
      </div>

      {loading && <p className="text-gray-500">{t('common.loading')}</p>}
      {error && <p className="text-red-600 dark:text-red-400">{t('admin.loadError')}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-surface">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="px-4 py-3 font-medium">{t('admin.order')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.date')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.customer')}</th>
                <th className="px-4 py-3 font-medium">{t('orderDetails.paymentMethod')}</th>
                <th className="px-4 py-3 text-right font-medium">{t('admin.itemsCount')}</th>
                <th className="px-4 py-3 text-right font-medium">{t('admin.totalColumn')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map((o) => (
                // Tot rândul e clicabil; linkul de pe număr asigură accesul cu tastatura
                <tr
                  key={o.id}
                  onClick={() => navigate(`/admin/comenzi/${o.id}`)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/comenzi/${o.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-mono text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      #{shortOrderId(o.id)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">{formatDate(o.createdAt, true)}</td>
                  <td className="px-4 py-3">
                    <span className="text-gray-900">{o.shipping?.name ?? '—'}</span>
                    <span className="block text-xs text-gray-500">
                      {o.shipping ? `${o.shipping.city}, ${o.shipping.county} · ` : ''}
                      {o.userId ? t('admin.customerAccount') : t('admin.customerGuest')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{o.paymentMethod ? t(`payment.${o.paymentMethod}`) : '—'}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-700">{o.totalItems}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-gray-900">{formatPrice(o.totalPrice)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && <p className="px-4 py-8 text-center text-gray-500">{t('adminOrders.noResults')}</p>}
        </div>
      )}
    </div>
  )
}
