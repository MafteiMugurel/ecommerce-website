import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import AdminNav from '../components/admin/AdminNav'
import OrderStatusBadge from '../components/OrderStatusBadge'
import ProductImage from '../components/ProductImage'
import { getOrder, updateOrderStatus } from '../services/orderService'
import { ORDER_STATUSES, type Order, type OrderStatus } from '../types/order'
import { formatDate, formatPrice, shortOrderId } from '../utils/format'

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-surface p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
      {children}
    </section>
  )
}

export default function AdminOrderDetailPage() {
  const { t } = useTranslation()
  const { orderId } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('idle')

  useEffect(() => {
    if (!orderId) return
    let active = true
    getOrder(orderId)
      .then((result) => {
        if (active) setOrder(result)
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
  }, [orderId])

  async function changeStatus(status: OrderStatus) {
    if (!order) return
    const previous = order.status
    setOrder({ ...order, status })
    setSaving(true)
    setSaveState('idle')
    try {
      await updateOrderStatus(order.id, status)
      setSaveState('saved')
    } catch {
      setOrder({ ...order, status: previous })
      setSaveState('error')
    } finally {
      setSaving(false)
    }
  }

  const backLink = (
    <Link to="/admin/comenzi" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
      ← {t('adminOrders.back')}
    </Link>
  )

  if (loading) return <p className="mx-auto max-w-5xl px-4 py-8 text-gray-500 sm:px-6">{t('common.loading')}</p>

  if (error || !order) {
    return (
      <section className="mx-auto max-w-5xl space-y-4 px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">{error ? t('adminOrders.loadError') : t('adminOrders.notFound')}</h1>
        {backLink}
      </section>
    )
  }

  const { shipping } = order

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <div className="space-y-3">
        <AdminNav />
        {backLink}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex flex-wrap items-center gap-3 text-2xl font-bold text-gray-900 sm:text-3xl">
              {t('adminOrders.orderTitle', { id: shortOrderId(order.id) })}
              <OrderStatusBadge status={order.status} />
            </h1>
            <p className="text-sm text-gray-500">{t('adminOrders.placedOn', { date: formatDate(order.createdAt, true) })}</p>
          </div>

          {/* Schimbarea statusului */}
          <label className="flex flex-col text-sm font-medium text-gray-700">
            {t('adminOrders.statusLabel')}
            <select
              value={order.status}
              disabled={saving}
              onChange={(e) => void changeStatus(e.target.value as OrderStatus)}
              className="mt-1 rounded-lg border border-gray-300 bg-surface px-3 py-2 text-sm text-gray-900"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`orderStatus.${s}`)}
                </option>
              ))}
            </select>
            {saveState === 'saved' && (
              <span className="mt-1 text-xs font-normal text-green-600 dark:text-green-400">✓ {t('adminOrders.statusSaved')}</span>
            )}
            {saveState === 'error' && (
              <span role="alert" className="mt-1 text-xs font-normal text-red-600 dark:text-red-400">
                {t('admin.statusError')}
              </span>
            )}
          </label>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card title={t('adminOrders.customer')}>
          <p className="font-medium text-gray-900">{shipping?.name ?? '—'}</p>
          <p className="text-sm text-gray-600">{order.userId ? t('adminOrders.account') : t('adminOrders.guest')}</p>
          {order.userId && (
            <p className="mt-2 break-all font-mono text-xs text-gray-500">
              {t('adminOrders.accountId')}: {order.userId}
            </p>
          )}
          {shipping && (
            <div className="mt-3 space-y-0.5 text-sm">
              <a href={`mailto:${shipping.email}`} className="block break-all text-indigo-600 dark:text-indigo-400 hover:underline">
                {shipping.email}
              </a>
              <a href={`tel:${shipping.phone}`} className="block text-indigo-600 dark:text-indigo-400 hover:underline">
                {shipping.phone}
              </a>
            </div>
          )}
        </Card>

        <Card title={t('adminOrders.delivery')}>
          {shipping ? (
            <address className="text-sm not-italic text-gray-900">
              {shipping.name}
              <br />
              {shipping.address}
              <br />
              {shipping.city}
              <br />
              {shipping.county}
            </address>
          ) : (
            <p className="text-sm text-gray-500">{t('adminOrders.noShipping')}</p>
          )}
        </Card>

        <Card title={t('adminOrders.payment')}>
          <p className="text-sm font-medium text-gray-900">
            {order.paymentMethod ? t(`payment.${order.paymentMethod}`) : '—'}
          </p>
          {order.paymentMethod && <p className="mt-1 text-xs text-gray-500">{t(`payment.${order.paymentMethod}Hint`)}</p>}
          <p className="mt-3 text-2xl font-bold tabular-nums text-gray-900">{formatPrice(order.totalPrice)}</p>
        </Card>
      </div>

      <Card title={t('adminOrders.items')}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="py-2 pr-3 font-medium">{t('admin.product')}</th>
                <th className="py-2 pr-3 text-right font-medium">{t('adminOrders.unitPrice')}</th>
                <th className="py-2 pr-3 text-right font-medium">{t('adminOrders.quantity')}</th>
                <th className="py-2 text-right font-medium">{t('adminOrders.subtotal')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <tr key={item.productId}>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <ProductImage src={item.imageUrl} className="h-12 w-12 shrink-0 rounded-lg bg-gray-100 object-contain" />
                      <div className="min-w-0">
                        <Link
                          to={`/produs/${item.productId}`}
                          className="font-medium text-gray-900 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          {item.name}
                        </Link>
                        <p className="font-mono text-xs text-gray-500">{item.productId.toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-right tabular-nums text-gray-700">{formatPrice(item.price, item.currency)}</td>
                  <td className="py-3 pr-3 text-right tabular-nums text-gray-700">{item.quantity}</td>
                  <td className="py-3 text-right tabular-nums font-medium text-gray-900">
                    {formatPrice(item.price * item.quantity, item.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200">
                <td colSpan={2} className="pt-3 text-sm text-gray-600">
                  {t('common.products', { count: order.totalItems })}
                </td>
                <td colSpan={2} className="pt-3 text-right text-base font-semibold tabular-nums text-gray-900">
                  {t('cart.total')}: {formatPrice(order.totalPrice)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <p className="font-mono text-xs text-gray-400">
        {t('adminOrders.fullId')}: {order.id}
      </p>
    </div>
  )
}
