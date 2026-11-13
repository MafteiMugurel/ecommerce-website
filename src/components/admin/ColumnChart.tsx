import { useState } from 'react'

export interface ColumnDatum {
  key: string
  /** eticheta de pe axa X (afișată selectiv) */
  label: string
  /** textul complet din tooltip (ex. data întreagă) */
  tooltipLabel: string
  value: number
}

interface ColumnChartProps {
  data: ColumnDatum[]
  formatValue: (value: number) => string
  /** câte etichete pe axa X să afișăm (restul se omit ca să nu se suprapună) */
  maxXLabels?: number
  height?: number
}

/** Rotunjește maximul axei la o valoare „frumoasă” (1, 2, 2.5, 5 × 10^n). */
function niceMax(value: number) {
  if (value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= value) ?? 10
  return step * magnitude
}

/**
 * Grafic cu coloane pentru o singură serie (ex. venituri pe zi).
 * O singură culoare, fără legendă (titlul cardului numește seria),
 * grilă discretă, tooltip la hover/focus pe fiecare coloană.
 */
export default function ColumnChart({ data, formatValue, maxXLabels = 6, height = 220 }: ColumnChartProps) {
  const [active, setActive] = useState<number | null>(null)
  const max = niceMax(Math.max(0, ...data.map((d) => d.value)))
  const ticks = [max, max / 2, 0]
  const labelEvery = Math.max(1, Math.ceil(data.length / maxXLabels))
  const activeDatum = active !== null ? data[active] : null

  return (
    <div className="flex gap-2">
      {/* Axa Y */}
      <div className="relative w-16 shrink-0 text-right text-[11px] text-gray-500 tabular-nums" style={{ height }}>
        {ticks.map((tick, i) => (
          <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}>
            {formatValue(tick)}
          </span>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div className="relative" style={{ height }} onMouseLeave={() => setActive(null)}>
          {/* Grilă orizontală discretă + linia de bază */}
          {ticks.map((tick, i) => (
            <div
              key={tick}
              className={`absolute inset-x-0 border-t ${i === ticks.length - 1 ? 'border-gray-300' : 'border-gray-100'}`}
              style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}
            />
          ))}

          {/* Coloane: gap de 2px între ele, capăt rotunjit sus, ancorate pe linia de bază */}
          <div className="absolute inset-0 flex items-end gap-[2px]">
            {data.map((d, i) => (
              <button
                key={d.key}
                type="button"
                className="group flex h-full min-w-0 flex-1 items-end focus:outline-none"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                aria-label={`${d.tooltipLabel}: ${formatValue(d.value)}`}
              >
                <span
                  className={`block w-full rounded-t-[4px] bg-series-1 transition-opacity ${
                    active !== null && active !== i ? 'opacity-50' : ''
                  } group-focus-visible:ring-2 group-focus-visible:ring-indigo-300`}
                  style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 2 : 0 }}
                />
              </button>
            ))}
          </div>

          {/* Tooltip */}
          {activeDatum && active !== null && (
            <div
              className={`pointer-events-none absolute -top-2 z-10 -translate-y-full whitespace-nowrap rounded-lg border border-gray-200 bg-surface px-3 py-2 text-xs shadow-lg ${
                // la margini, tooltip-ul se aliniază spre interior ca să nu iasă din card
                active < data.length * 0.2 ? '' : active > data.length * 0.8 ? '-translate-x-full' : '-translate-x-1/2'
              }`}
              style={{ left: `${((active + 0.5) / data.length) * 100}%` }}
              role="status"
            >
              <p className="text-gray-500">{activeDatum.tooltipLabel}</p>
              <p className="font-semibold text-gray-900 tabular-nums">{formatValue(activeDatum.value)}</p>
            </div>
          )}
        </div>

        {/* Axa X: etichete selective */}
        <div className="mt-1.5 flex gap-[2px] text-[11px] text-gray-500">
          {data.map((d, i) => (
            <span key={d.key} className="min-w-0 flex-1 overflow-visible whitespace-nowrap text-center">
              {i % labelEvery === 0 ? d.label : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
