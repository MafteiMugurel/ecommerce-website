import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import AdminNav from '../components/admin/AdminNav'
import BarList from '../components/admin/BarList'
import ChartCard from '../components/admin/ChartCard'
import ColumnChart from '../components/admin/ColumnChart'
import DonutChart from '../components/admin/DonutChart'
import StatTile from '../components/admin/StatTile'
import OrderStatusBadge from '../components/OrderStatusBadge'
import { useProducts } from '../hooks/useProducts'
import { currentLocale } from '../i18n'
import { useCategoryLabel } from '../i18n/useCategoryLabel'
import { getMessages, getStoreCounts, type ContactMessageRecord, type StoreCounts } from '../services/adminService'
import { getAllOrders, updateOrderStatus } from '../services/orderService'
import { ORDER_STATUSES, PAYMENT_METHODS, type Order, type OrderStatus } from '../types/order'
import { formatCompactPrice, formatDate, formatNumber, formatPrice, shortOrderId } from '../utils/format'

const PERIODS = [
  { days: 7 },
  { days: 30 },
  { days: 90 },
] as const

const DAY_MS = 86_400_000
const LOW_STOCK_LIMIT = 5
const TOP_COUNTIES = 5

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

const tableClass = 'w-full text-left text-sm'
const thClass = 'border-b border-gray-200 py-2 pr-3 font-medium text-gray-500'
const tdClass = 'border-b border-gray-100 py-2 pr-3 text-gray-900'

export default function AdminPage() {
  const { t } = useTranslation()
  const categoryLabel = useCategoryLabel()
  const { products, loading: productsLoading } = useProducts()
  const [orders, setOrders] = useState<Order[]>([])
  const [counts, setCounts] = useState<StoreCounts | null>(null)
  const [messages, setMessages] = useState<ContactMessageRecord[]>([])
  const [loading, setLoading] = useState(true)
  // cheia mesajului de eroare (tradus la afișare, deci urmează limba aleasă)
  const [error, setError] = useState<'admin.loadError' | 'admin.statusError' | null>(null)
  const [periodDays, setPeriodDays] = useState<number>(30)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  // Momentul de referință pentru perioade, fixat la deschiderea paginii
  const [now] = useState(() => Date.now())

  useEffect(() => {
    let active = true
    Promise.all([getAllOrders(), getStoreCounts(), getMessages()])
      .then(([allOrders, storeCounts, allMessages]) => {
        if (!active) return
        setOrders(allOrders)
        setCounts(storeCounts)
        setMessages(allMessages)
      })
      .catch(() => {
        if (active) setError('admin.loadError')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const since = now - periodDays * DAY_MS
    const inPeriod = orders.filter((o) => new Date(o.createdAt).getTime() >= since)
    const valid = inPeriod.filter((o) => o.status !== 'cancelled')
    const revenue = valid.reduce((sum, o) => sum + o.totalPrice, 0)
    const unitsSold = valid.reduce((sum, o) => sum + o.totalItems, 0)

    // Venituri pe zi (inclusiv zilele fără vânzări)
    const byDay = new Map<string, number>()
    for (let i = periodDays - 1; i >= 0; i--) byDay.set(dayKey(new Date(now - i * DAY_MS)), 0)
    for (const o of valid) {
      const key = o.createdAt.slice(0, 10)
      if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + o.totalPrice)
    }
    const daily = [...byDay.entries()].map(([key, value]) => {
      const date = new Date(`${key}T12:00:00`)
      return {
        key,
        value,
        label: date.toLocaleDateString(currentLocale(), { day: 'numeric', month: 'short' }),
        tooltipLabel: date.toLocaleDateString(currentLocale(), { weekday: 'long', day: 'numeric', month: 'long' }),
      }
    })

    // Venituri pe categorie și top produse (după bucăți vândute)
    const categoryOf = new Map(products.map((p) => [p.id, p.category]))
    const byCategory = new Map<string, number>()
    const byProduct = new Map<string, { name: string; units: number; revenue: number }>()
    for (const o of valid) {
      for (const item of o.items) {
        const category = categoryOf.get(item.productId) ?? t('admin.otherCategory')
        byCategory.set(category, (byCategory.get(category) ?? 0) + item.price * item.quantity)
        const entry = byProduct.get(item.productId) ?? { name: item.name, units: 0, revenue: 0 }
        entry.units += item.quantity
        entry.revenue += item.price * item.quantity
        byProduct.set(item.productId, entry)
      }
    }

    const byCounty = new Map<string, number>()
    const byPayment = new Map<string, number>()
    for (const o of inPeriod) {
      if (o.shipping?.county) byCounty.set(o.shipping.county, (byCounty.get(o.shipping.county) ?? 0) + 1)
      if (o.paymentMethod) byPayment.set(o.paymentMethod, (byPayment.get(o.paymentMethod) ?? 0) + 1)
    }

    const statusCounts = ORDER_STATUSES.map((status) => ({
      status,
      count: inPeriod.filter((o) => o.status === status).length,
    }))

    return {
      ordersCount: inPeriod.length,
      revenue,
      unitsSold,
      averageOrder: valid.length ? revenue / valid.length : 0,
      registeredShare: inPeriod.length ? inPeriod.filter((o) => o.userId).length / inPeriod.length : 0,
      daily,
      byCategory: [...byCategory.entries()].map(([name, value]) => ({ key: name, label: categoryLabel(name), value })),
      topProducts: [...byProduct.entries()]
        .map(([id, p]) => ({ id, ...p }))
        .sort((a, b) => b.units - a.units || b.revenue - a.revenue)
        .slice(0, 5),
      statusCounts,
      // toate județele (pentru tabel) și primele N + „Alte județe” (pentru grafic)
      byCounty: [...byCounty.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([county, value]) => ({ key: county, label: county, value })),
      byPayment: PAYMENT_METHODS.map((method) => ({
        key: method,
        label: t(`payment.${method}`),
        value: byPayment.get(method) ?? 0,
      })).filter((d) => d.value > 0),
    }
    // t se schimbă odată cu limba, deci etichetele (zile, categorii) se refac automat
  }, [orders, products, periodDays, now, t, categoryLabel])

  const lowStock = useMemo(
    () => products.filter((p) => p.stock <= LOW_STOCK_LIMIT).sort((a, b) => a.stock - b.stock),
    [products],
  )

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    const previous = orders
    setUpdatingOrder(orderId)
    setOrders((current) => current.map((o) => (o.id === orderId ? { ...o, status } : o)))
    try {
      await updateOrderStatus(orderId, status)
    } catch {
      setOrders(previous)
      setError('admin.statusError')
    } finally {
      setUpdatingOrder(null)
    }
  }

  if (loading || productsLoading) {
    return <p className="mx-auto max-w-7xl px-4 py-8 text-gray-500 sm:px-6 lg:px-8">{t('admin.loading')}</p>
  }

  const periodLabel = t('admin.lastDays', { count: periodDays })
  const formatPercent = (share: number) =>
    new Intl.NumberFormat(currentLocale(), { style: 'percent', maximumFractionDigits: 0 }).format(share)
  // Graficul arată primele județe + „Alte județe”; tabelul le arată pe toate
  const otherCountiesTotal = stats.byCounty.slice(TOP_COUNTIES).reduce((sum, d) => sum + d.value, 0)
  const countySlices = [
    ...stats.byCounty.slice(0, TOP_COUNTIES),
    ...(otherCountiesTotal > 0
      ? [{ key: 'other', label: t('admin.otherCounties'), value: otherCountiesTotal, other: true }]
      : []),
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Titlu + filtrul de perioadă (un singur rând, deasupra graficelor) */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <AdminNav />
          <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t('admin.title')}</h1>
          <p className="text-sm text-gray-500">{t('admin.subtitle', { count: periodDays })}</p>
          </div>
        </div>
        <div className="flex rounded-lg border border-gray-200 bg-surface p-0.5 text-sm" role="group" aria-label={t('admin.period')}>
          {PERIODS.map((period) => (
            <button
              key={period.days}
              type="button"
              onClick={() => setPeriodDays(period.days)}
              aria-pressed={periodDays === period.days}
              className={`rounded-md px-3 py-1.5 font-medium transition ${
                periodDays === period.days ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('admin.periodDays', { count: period.days })}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {t(error)}
        </p>
      )}

      {/* Cifre-cheie */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label={t('admin.revenue')} value={formatPrice(stats.revenue)} detail={t('admin.revenueDetail')} />
        <StatTile
          label={t('admin.orders')}
          value={formatNumber(stats.ordersCount)}
          detail={t('admin.ordersDetail', { percent: formatNumber(stats.registeredShare * 100) })}
        />
        <StatTile label={t('admin.averageOrder')} value={formatPrice(stats.averageOrder)} />
        <StatTile label={t('admin.unitsSold')} value={formatNumber(stats.unitsSold)} detail={t('admin.unitsDetail')} />
        <StatTile label={t('admin.users')} value={formatNumber(counts?.users ?? 0)} detail={t('admin.total')} />
        <StatTile
          label={t('admin.reviews')}
          value={formatNumber(counts?.reviews ?? 0)}
          detail={t('admin.reviewsDetail', { rating: formatNumber(counts?.averageRating ?? 0, 2) })}
        />
        <StatTile
          label={t('admin.catalog')}
          value={formatNumber(products.length)}
          detail={t('admin.catalogDetail', { count: products.filter((p) => p.stock === 0).length })}
        />
        <StatTile label={t('admin.messages')} value={formatNumber(messages.length)} detail={t('admin.total')} />
      </div>

      {/* Grafice */}
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <ChartCard
          title={t('admin.revenueByDay')}
          subtitle={t('admin.revenueByDaySubtitle', { count: periodDays })}
          chart={
            <ColumnChart
              data={stats.daily}
              formatValue={formatCompactPrice}
              maxXLabels={periodDays === 7 ? 7 : 6}
            />
          }
          table={
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>{t('admin.day')}</th>
                  <th className={`${thClass} text-right`}>{t('admin.revenue')}</th>
                </tr>
              </thead>
              <tbody>
                {[...stats.daily].reverse().map((d) => (
                  <tr key={d.key}>
                    <td className={tdClass}>{d.tooltipLabel}</td>
                    <td className={`${tdClass} text-right tabular-nums`}>{formatPrice(d.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        />

        <ChartCard
          title={t('admin.revenueByCategory')}
          subtitle={periodLabel}
          chart={
            stats.byCategory.length ? (
              <BarList data={stats.byCategory} formatValue={formatCompactPrice} />
            ) : (
              <p className="text-sm text-gray-500">{t('admin.noSales')}</p>
            )
          }
          table={
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>{t('product.category')}</th>
                  <th className={`${thClass} text-right`}>{t('admin.revenue')}</th>
                </tr>
              </thead>
              <tbody>
                {[...stats.byCategory].sort((a, b) => b.value - a.value).map((d) => (
                  <tr key={d.key}>
                    <td className={tdClass}>{d.label}</td>
                    <td className={`${tdClass} text-right tabular-nums`}>{formatPrice(d.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title={t('admin.ordersByCounty')}
          subtitle={periodLabel}
          chart={
            stats.byCounty.length ? (
              <DonutChart
                data={countySlices}
                centerLabel={t('admin.ordersCenter')}
                formatValue={(v) => formatNumber(v)}
                formatPercent={formatPercent}
              />
            ) : (
              <p className="text-sm text-gray-500">{t('admin.noSales')}</p>
            )
          }
          table={
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>{t('admin.county')}</th>
                  <th className={`${thClass} text-right`}>{t('admin.ordersCount')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.byCounty.map((d) => (
                  <tr key={d.key}>
                    <td className={tdClass}>{d.label}</td>
                    <td className={`${tdClass} text-right tabular-nums`}>{d.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        />
        <ChartCard
          title={t('admin.paymentMethods')}
          subtitle={periodLabel}
          chart={
            stats.byPayment.length ? (
              <DonutChart
                data={stats.byPayment}
                centerLabel={t('admin.ordersCenter')}
                formatValue={(v) => formatNumber(v)}
                formatPercent={formatPercent}
              />
            ) : (
              <p className="text-sm text-gray-500">{t('admin.noSales')}</p>
            )
          }
          table={
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>{t('orderDetails.paymentMethod')}</th>
                  <th className={`${thClass} text-right`}>{t('admin.ordersCount')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.byPayment.map((d) => (
                  <tr key={d.key}>
                    <td className={tdClass}>{d.label}</td>
                    <td className={`${tdClass} text-right tabular-nums`}>{d.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top produse */}
        <section className="rounded-2xl border border-gray-200 bg-surface p-5 lg:col-span-2">
          <h2 className="mb-3 font-semibold text-gray-900">{t('admin.topProducts')}</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-gray-500">{t('admin.noSales')}</p>
          ) : (
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>#</th>
                  <th className={thClass}>{t('admin.product')}</th>
                  <th className={`${thClass} text-right`}>{t('admin.units')}</th>
                  <th className={`${thClass} text-right`}>{t('admin.revenue')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((p, i) => (
                  <tr key={p.id}>
                    <td className={`${tdClass} text-gray-500`}>{i + 1}</td>
                    <td className={tdClass}>
                      <Link to={`/produs/${p.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                        {p.name}
                      </Link>
                    </td>
                    <td className={`${tdClass} text-right tabular-nums`}>{p.units}</td>
                    <td className={`${tdClass} text-right tabular-nums`}>{formatPrice(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Comenzi pe status */}
        <section className="rounded-2xl border border-gray-200 bg-surface p-5">
          <h2 className="mb-3 font-semibold text-gray-900">{t('admin.ordersByStatus')}</h2>
          <ul className="space-y-2.5">
            {stats.statusCounts.map(({ status, count }) => (
              <li key={status} className="flex items-center justify-between">
                <OrderStatusBadge status={status} />
                <span className="text-sm font-medium text-gray-900 tabular-nums">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Comenzi recente, cu schimbare de status */}
      <section className="rounded-2xl border border-gray-200 bg-surface p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-semibold text-gray-900">{t('admin.recentOrders')}</h2>
          <Link to="/admin/comenzi" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            {t('adminOrders.viewAll')} →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className={`${tableClass} min-w-[640px]`}>
            <thead>
              <tr>
                <th className={thClass}>{t('admin.order')}</th>
                <th className={thClass}>{t('admin.date')}</th>
                <th className={thClass}>{t('admin.customer')}</th>
                <th className={`${thClass} text-right`}>{t('admin.itemsCount')}</th>
                <th className={`${thClass} text-right`}>{t('admin.totalColumn')}</th>
                <th className={thClass}>{t('admin.status')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((o) => (
                <tr key={o.id}>
                  <td className={`${tdClass} font-mono text-xs`}>
                    <Link
                      to={`/admin/comenzi/${o.id}`}
                      className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                      title={t('adminOrders.details')}
                    >
                      #{shortOrderId(o.id)}
                    </Link>
                  </td>
                  <td className={tdClass}>{formatDate(o.createdAt)}</td>
                  <td className={`${tdClass} text-gray-600`}>
                    {o.shipping ? (
                      <>
                        <span className="text-gray-900">{o.shipping.name}</span>
                        <span className="block text-xs">
                          {o.shipping.city} · {o.userId ? t('admin.customerAccount') : t('admin.customerGuest')}
                        </span>
                      </>
                    ) : o.userId ? (
                      t('admin.customerAccount')
                    ) : (
                      t('admin.customerGuest')
                    )}
                  </td>
                  <td className={`${tdClass} text-right tabular-nums`}>{o.totalItems}</td>
                  <td className={`${tdClass} text-right tabular-nums`}>{formatPrice(o.totalPrice)}</td>
                  <td className={tdClass}>
                    <select
                      value={o.status}
                      disabled={updatingOrder === o.id}
                      onChange={(e) => void handleStatusChange(o.id, e.target.value as OrderStatus)}
                      aria-label={t('admin.statusFor', { id: o.id.slice(0, 8) })}
                      className="rounded-md border border-gray-300 bg-surface px-2 py-1 text-sm text-gray-900"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {t(`orderStatus.${status}`)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stoc redus */}
        <section className="rounded-2xl border border-gray-200 bg-surface p-5">
          <h2 className="mb-3 font-semibold text-gray-900">{t('admin.lowStock', { count: LOW_STOCK_LIMIT })}</h2>
          <ul className="divide-y divide-gray-100">
            {lowStock.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <Link to={`/produs/${p.id}`} className="truncate text-gray-900 hover:text-indigo-600 dark:hover:text-indigo-400">
                  {p.name}
                </Link>
                <span
                  className={`shrink-0 font-medium tabular-nums ${p.stock === 0 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}
                >
                  {p.stock === 0 ? t('admin.soldOut') : t('admin.pieces', { count: p.stock })}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Mesaje */}
        <section className="rounded-2xl border border-gray-200 bg-surface p-5">
          <h2 className="mb-3 font-semibold text-gray-900">{t('admin.latestMessages')}</h2>
          {messages.length === 0 ? (
            <p className="text-sm text-gray-500">{t('admin.noMessages')}</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {messages.slice(0, 5).map((m) => (
                <li key={m.id} className="py-2.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="truncate font-medium text-gray-900">{m.subject}</span>
                    <span className="shrink-0 text-xs text-gray-500">{formatDate(m.createdAt)}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {m.name} · {m.email}
                  </p>
                  <p className="mt-1 line-clamp-2 text-gray-700">{m.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
