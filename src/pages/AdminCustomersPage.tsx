import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AdminNav from '../components/admin/AdminNav'
import ChartCard from '../components/admin/ChartCard'
import ColumnChart from '../components/admin/ColumnChart'
import DonutChart from '../components/admin/DonutChart'
import StatTile from '../components/admin/StatTile'
import { currentLocale } from '../i18n'
import { getCustomers, type CustomerProfile } from '../services/adminService'
import { getAllOrders } from '../services/orderService'
import type { Order } from '../types/order'
import { formatCompactPrice, formatDate, formatNumber, formatPrice } from '../utils/format'
import { normalize } from '../utils/search'

const PERIODS = [7, 30, 90] as const
const DAY_MS = 86_400_000
const TOP_CUSTOMERS = 10

/** Un client cu indicatorii calculați din comenzile lui. */
interface CustomerRow extends CustomerProfile {
  orders: number
  spent: number
  lastOrder: string | null
}

const tableClass = 'w-full text-left text-sm'
const thClass = 'border-b border-gray-200 py-2 pr-3 font-medium text-gray-500'
const tdClass = 'border-b border-gray-100 py-2 pr-3 text-gray-900'

export default function AdminCustomersPage() {
  const { t } = useTranslation()
  const [customers, setCustomers] = useState<CustomerProfile[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [periodDays, setPeriodDays] = useState<number>(30)
  const [query, setQuery] = useState('')
  // Momentul de referință pentru perioade, fixat la deschiderea paginii
  const [now] = useState(() => Date.now())

  useEffect(() => {
    let active = true
    Promise.all([getCustomers(), getAllOrders()])
      .then(([profiles, allOrders]) => {
        if (!active) return
        setCustomers(profiles)
        setOrders(allOrders)
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

  // Indicatorii fiecărui client (pe toată istoria comenzilor; comenzile anulate nu se pun la sume)
  const rows = useMemo<CustomerRow[]>(() => {
    const byUser = new Map<string, { orders: number; spent: number; lastOrder: string | null }>()
    for (const o of orders) {
      if (!o.userId || o.status === 'cancelled') continue
      const entry = byUser.get(o.userId) ?? { orders: 0, spent: 0, lastOrder: null }
      entry.orders += 1
      entry.spent += o.totalPrice
      if (!entry.lastOrder || o.createdAt > entry.lastOrder) entry.lastOrder = o.createdAt
      byUser.set(o.userId, entry)
    }
    return customers
      .map((c) => ({ ...c, ...(byUser.get(c.id) ?? { orders: 0, spent: 0, lastOrder: null }) }))
      .sort((a, b) => b.spent - a.spent || a.displayName.localeCompare(b.displayName))
  }, [customers, orders])

  const stats = useMemo(() => {
    const since = now - periodDays * DAY_MS
    const inPeriod = (iso: string) => iso !== '' && new Date(iso).getTime() >= since
    const buyers = rows.filter((r) => r.orders > 0)

    // Conturi noi pe zi (inclusiv zilele fără înregistrări)
    const byDay = new Map<string, number>()
    for (let i = periodDays - 1; i >= 0; i--) byDay.set(new Date(now - i * DAY_MS).toISOString().slice(0, 10), 0)
    for (const c of customers) {
      const key = c.createdAt.slice(0, 10)
      if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + 1)
    }
    const signups = [...byDay.entries()].map(([key, value]) => {
      const date = new Date(`${key}T12:00:00`)
      return {
        key,
        value,
        label: date.toLocaleDateString(currentLocale(), { day: 'numeric', month: 'short' }),
        tooltipLabel: date.toLocaleDateString(currentLocale(), { weekday: 'long', day: 'numeric', month: 'long' }),
      }
    })

    // Venituri în perioadă: clienți cu cont vs. vizitatori
    const periodOrders = orders.filter((o) => o.status !== 'cancelled' && inPeriod(o.createdAt))
    const registeredRevenue = periodOrders.filter((o) => o.userId).reduce((s, o) => s + o.totalPrice, 0)
    const guestRevenue = periodOrders.filter((o) => !o.userId).reduce((s, o) => s + o.totalPrice, 0)
    const activeIds = new Set(periodOrders.filter((o) => o.userId).map((o) => o.userId))

    const segment = (min: number, max: number) => rows.filter((r) => r.orders >= min && r.orders <= max).length

    return {
      total: customers.length,
      newInPeriod: customers.filter((c) => inPeriod(c.createdAt)).length,
      active: rows.filter((r) => activeIds.has(r.id)).length,
      repeat: rows.filter((r) => r.orders >= 2).length,
      conversion: customers.length ? buyers.length / customers.length : 0,
      avgSpent: buyers.length ? buyers.reduce((s, r) => s + r.spent, 0) / buyers.length : 0,
      avgOrders: buyers.length ? buyers.reduce((s, r) => s + r.orders, 0) / buyers.length : 0,
      signups,
      revenueSplit: [
        { key: 'registered', label: t('adminCustomers.registered'), value: registeredRevenue },
        { key: 'guests', label: t('adminCustomers.guests'), value: guestRevenue },
      ].filter((d) => d.value > 0),
      segments: [
        { key: 's1', label: t('adminCustomers.segment1'), value: segment(1, 1) },
        { key: 's2', label: t('adminCustomers.segment2'), value: segment(2, 3) },
        { key: 's4', label: t('adminCustomers.segment4'), value: segment(4, Infinity) },
        { key: 's0', label: t('adminCustomers.segment0'), value: segment(0, 0), other: true },
      ].filter((d) => d.value > 0),
    }
  }, [rows, customers, orders, periodDays, now, t])

  const visible = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean)
    return rows.filter((r) => {
      const text = normalize(`${r.displayName} ${r.email}`)
      return terms.every((term) => text.includes(term))
    })
  }, [rows, query])

  const formatPercent = (share: number) =>
    new Intl.NumberFormat(currentLocale(), { style: 'percent', maximumFractionDigits: 0 }).format(share)
  const periodLabel = t('admin.lastDays', { count: periodDays })

  if (loading) return <p className="mx-auto max-w-7xl px-4 py-8 text-gray-500 sm:px-6 lg:px-8">{t('common.loading')}</p>

  const customerTable = (list: CustomerRow[]) => (
    <div className="overflow-x-auto">
      <table className={`${tableClass} min-w-[720px]`}>
        <thead>
          <tr>
            <th className={thClass}>{t('adminCustomers.name')}</th>
            <th className={thClass}>{t('adminCustomers.registeredOn')}</th>
            <th className={`${thClass} text-right`}>{t('adminCustomers.ordersCount')}</th>
            <th className={`${thClass} text-right`}>{t('adminCustomers.spent')}</th>
            <th className={thClass}>{t('adminCustomers.lastOrder')}</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r) => (
            <tr key={r.id}>
              <td className={tdClass}>
                <span className="font-medium">{r.displayName || t('adminCustomers.unnamed')}</span>
                <a href={`mailto:${r.email}`} className="block text-xs text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                  {r.email}
                </a>
              </td>
              <td className={`${tdClass} whitespace-nowrap text-gray-700`}>{r.createdAt ? formatDate(r.createdAt) : '—'}</td>
              <td className={`${tdClass} text-right tabular-nums`}>{r.orders}</td>
              <td className={`${tdClass} text-right tabular-nums`}>{formatPrice(r.spent)}</td>
              <td className={`${tdClass} whitespace-nowrap text-gray-700`}>
                {r.lastOrder ? formatDate(r.lastOrder) : t('adminCustomers.never')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <AdminNav />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t('adminCustomers.title')}</h1>
            <p className="text-sm text-gray-500">{t('adminCustomers.subtitle', { count: periodDays })}</p>
          </div>
        </div>
        <div className="flex rounded-lg border border-gray-200 bg-surface p-0.5 text-sm" role="group" aria-label={t('admin.period')}>
          {PERIODS.map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setPeriodDays(days)}
              aria-pressed={periodDays === days}
              className={`rounded-md px-3 py-1.5 font-medium transition ${
                periodDays === days ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('admin.periodDays', { count: days })}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {t('admin.loadError')}
        </p>
      )}

      {/* Cifre-cheie */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatTile
          label={t('adminCustomers.total')}
          value={formatNumber(stats.total)}
          detail={t('adminCustomers.totalDetail', { count: stats.newInPeriod })}
        />
        <StatTile label={t('adminCustomers.active')} value={formatNumber(stats.active)} detail={t('adminCustomers.activeDetail')} />
        <StatTile label={t('adminCustomers.repeat')} value={formatNumber(stats.repeat)} detail={t('adminCustomers.repeatDetail')} />
        <StatTile
          label={t('adminCustomers.conversion')}
          value={formatPercent(stats.conversion)}
          detail={t('adminCustomers.conversionDetail')}
        />
        <StatTile label={t('adminCustomers.avgSpent')} value={formatPrice(stats.avgSpent)} detail={t('adminCustomers.avgSpentDetail')} />
        <StatTile
          label={t('adminCustomers.avgOrders')}
          value={formatNumber(stats.avgOrders, 1)}
          detail={t('adminCustomers.avgOrdersDetail')}
        />
      </div>

      {/* Grafice */}
      <ChartCard
        title={t('adminCustomers.signupsByDay')}
        subtitle={periodLabel}
        chart={<ColumnChart data={stats.signups} formatValue={(v) => formatNumber(v)} maxXLabels={periodDays === 7 ? 7 : 6} height={180} />}
        table={
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>{t('admin.day')}</th>
                <th className={`${thClass} text-right`}>{t('adminCustomers.signups')}</th>
              </tr>
            </thead>
            <tbody>
              {[...stats.signups].reverse().map((d) => (
                <tr key={d.key}>
                  <td className={tdClass}>{d.tooltipLabel}</td>
                  <td className={`${tdClass} text-right tabular-nums`}>{d.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title={t('adminCustomers.revenueSplit')}
          subtitle={periodLabel}
          chart={
            stats.revenueSplit.length ? (
              <DonutChart
                data={stats.revenueSplit}
                centerLabel={t('adminCustomers.revenueCenter')}
                formatValue={formatCompactPrice}
                formatPercent={formatPercent}
              />
            ) : (
              <p className="text-sm text-gray-500">{t('admin.noSales')}</p>
            )
          }
          table={
            <table className={tableClass}>
              <tbody>
                {stats.revenueSplit.map((d) => (
                  <tr key={d.key}>
                    <td className={tdClass}>{d.label}</td>
                    <td className={`${tdClass} text-right tabular-nums`}>{formatPrice(d.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        />
        <ChartCard
          title={t('adminCustomers.segments')}
          subtitle={t('admin.total')}
          chart={
            stats.segments.length ? (
              <DonutChart
                data={stats.segments}
                centerLabel={t('adminCustomers.customersCenter')}
                formatValue={(v) => formatNumber(v)}
                formatPercent={formatPercent}
              />
            ) : (
              <p className="text-sm text-gray-500">{t('adminCustomers.noCustomers')}</p>
            )
          }
          table={
            <table className={tableClass}>
              <tbody>
                {stats.segments.map((d) => (
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

      {/* Top clienți */}
      <section className="rounded-2xl border border-gray-200 bg-surface p-5">
        <h2 className="mb-3 font-semibold text-gray-900">{t('adminCustomers.topCustomers')}</h2>
        {customerTable(rows.filter((r) => r.spent > 0).slice(0, TOP_CUSTOMERS))}
      </section>

      {/* Toți clienții */}
      <section className="rounded-2xl border border-gray-200 bg-surface p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-gray-900">{t('adminCustomers.allCustomers')}</h2>
          <div className="flex items-center gap-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('adminCustomers.search')}
              aria-label={t('adminCustomers.search')}
              className="w-64 rounded-lg border border-gray-300 bg-surface px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <span className="text-sm text-gray-500">{t('adminCustomers.shown', { shown: visible.length, total: rows.length })}</span>
          </div>
        </div>
        {visible.length ? customerTable(visible) : <p className="py-6 text-center text-gray-500">{t('adminCustomers.noCustomers')}</p>}
      </section>
    </div>
  )
}
