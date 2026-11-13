export interface BarDatum {
  key: string
  label: string
  value: number
}

interface BarListProps {
  data: BarDatum[]
  formatValue: (value: number) => string
}

/**
 * Bare orizontale sortate descrescător (ex. vânzări pe categorie).
 * Eticheta categoriei și valoarea sunt scrise direct, deci nu e nevoie de axă sau legendă.
 */
export default function BarList({ data, formatValue }: BarListProps) {
  const sorted = [...data].sort((a, b) => b.value - a.value)
  const max = Math.max(1, ...sorted.map((d) => d.value))

  return (
    <ul className="space-y-3">
      {sorted.map((d) => (
        <li key={d.key} title={`${d.label}: ${formatValue(d.value)}`}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-gray-700">{d.label}</span>
            <span className="shrink-0 font-medium text-gray-900 tabular-nums">{formatValue(d.value)}</span>
          </div>
          <div className="h-2.5 rounded-r-[4px] bg-gray-100">
            <div
              className="h-full rounded-r-[4px] bg-series-1"
              style={{ width: `${(d.value / max) * 100}%`, minWidth: d.value > 0 ? 2 : 0 }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
