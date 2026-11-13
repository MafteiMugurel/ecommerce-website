import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface ChartCardProps {
  title: string
  subtitle?: string
  /** graficul */
  chart: ReactNode
  /** aceleași date ca tabel (alternativă accesibilă la grafic) */
  table: ReactNode
}

/** Card cu titlu și comutator Grafic / Tabel. */
export default function ChartCard({ title, subtitle, chart, table }: ChartCardProps) {
  const { t } = useTranslation()
  const [view, setView] = useState<'chart' | 'table'>('chart')

  return (
    <section className="rounded-2xl border border-gray-200 bg-surface p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex rounded-lg border border-gray-200 p-0.5 text-xs" role="group" aria-label={t('common.viewMode')}>
          {(['chart', 'table'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setView(option)}
              aria-pressed={view === option}
              className={`rounded-md px-2.5 py-1 font-medium transition ${
                view === option ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {option === 'chart' ? t('common.chart') : t('common.table')}
            </button>
          ))}
        </div>
      </div>
      {view === 'chart' ? chart : <div className="max-h-80 overflow-y-auto">{table}</div>}
    </section>
  )
}
