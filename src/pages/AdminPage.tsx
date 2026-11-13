import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import BarList from '../components/admin/BarList'
import ChartCard from '../components/admin/ChartCard'
import ColumnChart from '../components/admin/ColumnChart'
import StatTile from '../components/admin/StatTile'
import OrderStatusBadge from '../components/OrderStatusBadge'
import { useProducts } from '../hooks/useProducts'
import { getMessages, getStoreCounts, type ContactMessageRecord, type StoreCounts } from '../services/adminService'
import { getAllOrders, updateOrderStatus } from '../services/orderService'
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type Order, type OrderStatus } from '../types/order'
import { formatDate, formatNumber, formatPrice } from '../utils/format'

const PERIODS = [
  { days: 7, label: '7 zile' },
  { days: 30, label: '30 zile' },
  { days: 90, label: '90 zile' },
] as const

const DAY_MS = 86_400_000
const LOW_STOCK_LIMIT = 5

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

/** Format scurt pentru axe și carduri: 12.500 → „12,5 mii”, 1.250.000 → „1,25 mil.” */
function formatCompactPrice(value: number) {
  return `${new Intl.NumberFormat('ro-RO', { notation: 'compact', maximumFractionDigits: 1 }).format(value)} lei`
}

const tableClass = 'w-full text-left text-sm'
const thClass = 'border-b border-gray-200 py-2 pr-3 font-medium text-gray-500'
const tdClass = 'border-b border-gray-100 py-2 pr-3 text-gray-900'

export default function AdminPage() {
  const { products, loading: productsLoading } = useProducts()
  const [orders, setOrders] = useState<Order[]>([])
  const [counts, setCounts] = useState<StoreCounts | null>(null)
  const [messages, setMessages] = useState<ContactMessageRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
        if (active) setError('Nu am putut încărca datele. Verifică dacă ai rol de admin și dacă regulile Firestore sunt publicate.')
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
        label: date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' }),
        tooltipLabel: date.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' }),
      }
    })

    // Venituri pe categorie și top produse (după bucăți vândute)
    const categoryOf = new Map(products.map((p) => [p.id, p.category]))
    const byCategory = new Map<string, number>()
    const byProduct = new Map<string, { name: string; units: number; revenue: number }>()
    for (const o of valid) {
      for (const item of o.items) {
        const category = categoryOf.get(item.productId) ?? 'Altele'
        byCategory.set(category, (byCategory.get(category) ?? 0) + item.price * item.quantity)
        const entry = byProduct.get(item.productId) ?? { name: item.name, units: 0, revenue: 0 }
        entry.units += item.quantity
        entry.revenue += item.price * item.quantity
        byProduct.set(item.productId, entry)
      }
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
      byCategory: [...byCategory.entries()].map(([label, value]) => ({ key: label, label, value })),
      topProducts: [...byProduct.entries()]
        .map(([id, p]) => ({ id, ...p }))
        .sort((a, b) => b.units - a.units || b.revenue - a.revenue)
        .slice(0, 5),
      statusCounts,
    }
  }, [orders, products, periodDays, now])

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
      setError('Statusul comenzii nu a putut fi actualizat.')
    } finally {
      setUpdatingOrder(null)
    }
  }

  if (loading || productsLoading) {
    return <p className="mx-auto max-w-7xl px-4 py-8 text-gray-500 sm:px-6 lg:px-8">Se încarcă dashboard-ul...</p>
  }

  const periodLabel = `ultimele ${periodDays} de zile`

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Titlu + filtrul de perioadă (un singur rând, deasupra graficelor) */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Panou admin</h1>
          <p className="text-sm text-gray-500">Statistici pentru {periodLabel}</p>
        </div>
        <div className="flex rounded-lg border border-gray-200 bg-surface p-0.5 text-sm" role="group" aria-label="Perioadă">
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
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      {/* Cifre-cheie */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Venituri" value={formatPrice(stats.revenue)} detail="fără comenzile anulate" />
        <StatTile
          label="Comenzi"
          value={formatNumber(stats.ordersCount)}
          detail={`${formatNumber(stats.registeredShare * 100)}% de la clienți cu cont`}
        />
        <StatTile label="Valoare medie comandă" value={formatPrice(stats.averageOrder)} />
        <StatTile label="Produse vândute" value={formatNumber(stats.unitsSold)} detail="bucăți" />
        <StatTile label="Utilizatori înregistrați" value={formatNumber(counts?.users ?? 0)} detail="total" />
        <StatTile
          label="Recenzii"
          value={formatNumber(counts?.reviews ?? 0)}
          detail={`notă medie ${formatNumber(counts?.averageRating ?? 0, 2)} / 5`}
        />
        <StatTile
          label="Produse în catalog"
          value={formatNumber(products.length)}
          detail={`${products.filter((p) => p.stock === 0).length} cu stoc epuizat`}
        />
        <StatTile label="Mesaje de contact" value={formatNumber(messages.length)} detail="total" />
      </div>

      {/* Grafice */}
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <ChartCard
          title="Venituri pe zi"
          subtitle={`${periodLabel}, în lei`}
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
                  <th className={thClass}>Ziua</th>
                  <th className={`${thClass} text-right`}>Venituri</th>
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
          title="Venituri pe categorie"
          subtitle={periodLabel}
          chart={
            stats.byCategory.length ? (
              <BarList data={stats.byCategory} formatValue={formatCompactPrice} />
            ) : (
              <p className="text-sm text-gray-500">Nicio vânzare în această perioadă.</p>
            )
          }
          table={
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>Categorie</th>
                  <th className={`${thClass} text-right`}>Venituri</th>
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top produse */}
        <section className="rounded-2xl border border-gray-200 bg-surface p-5 lg:col-span-2">
          <h2 className="mb-3 font-semibold text-gray-900">Cele mai vândute produse</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-gray-500">Nicio vânzare în această perioadă.</p>
          ) : (
            <table className={tableClass}>
              <thead>
                <tr>
                  <th className={thClass}>#</th>
                  <th className={thClass}>Produs</th>
                  <th className={`${thClass} text-right`}>Bucăți</th>
                  <th className={`${thClass} text-right`}>Venituri</th>
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
          <h2 className="mb-3 font-semibold text-gray-900">Comenzi pe status</h2>
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
        <h2 className="mb-3 font-semibold text-gray-900">Comenzi recente</h2>
        <div className="overflow-x-auto">
          <table className={`${tableClass} min-w-[640px]`}>
            <thead>
              <tr>
                <th className={thClass}>Comandă</th>
                <th className={thClass}>Data</th>
                <th className={thClass}>Client</th>
                <th className={`${thClass} text-right`}>Produse</th>
                <th className={`${thClass} text-right`}>Total</th>
                <th className={thClass}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((o) => (
                <tr key={o.id}>
                  <td className={`${tdClass} font-mono text-xs`}>#{o.id.slice(0, 8).toUpperCase()}</td>
                  <td className={tdClass}>{formatDate(o.createdAt)}</td>
                  <td className={`${tdClass} text-gray-600`}>{o.userId ? 'Cont' : 'Vizitator'}</td>
                  <td className={`${tdClass} text-right tabular-nums`}>{o.totalItems}</td>
                  <td className={`${tdClass} text-right tabular-nums`}>{formatPrice(o.totalPrice)}</td>
                  <td className={tdClass}>
                    <select
                      value={o.status}
                      disabled={updatingOrder === o.id}
                      onChange={(e) => void handleStatusChange(o.id, e.target.value as OrderStatus)}
                      aria-label={`Status comanda ${o.id.slice(0, 8)}`}
                      className="rounded-md border border-gray-300 bg-surface px-2 py-1 text-sm text-gray-900"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {ORDER_STATUS_LABELS[status]}
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
          <h2 className="mb-3 font-semibold text-gray-900">Stoc redus (≤ {LOW_STOCK_LIMIT} buc.)</h2>
          <ul className="divide-y divide-gray-100">
            {lowStock.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <Link to={`/produs/${p.id}`} className="truncate text-gray-900 hover:text-indigo-600 dark:hover:text-indigo-400">
                  {p.name}
                </Link>
                <span
                  className={`shrink-0 font-medium tabular-nums ${p.stock === 0 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}
                >
                  {p.stock === 0 ? 'Epuizat' : `${p.stock} buc.`}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Mesaje */}
        <section className="rounded-2xl border border-gray-200 bg-surface p-5">
          <h2 className="mb-3 font-semibold text-gray-900">Ultimele mesaje de contact</h2>
          {messages.length === 0 ? (
            <p className="text-sm text-gray-500">Niciun mesaj.</p>
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
