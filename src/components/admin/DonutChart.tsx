import { useState } from 'react'

export interface DonutDatum {
  key: string
  label: string
  value: number
  /** true pentru felia „Altele” (culoare neutră) */
  other?: boolean
}

interface DonutChartProps {
  data: DonutDatum[]
  /** textul mic din centru, sub total (ex. „comenzi”) */
  centerLabel: string
  formatValue: (value: number) => string
  formatPercent: (share: number) => string
}

// Culorile categoriale, în ordine fixă (definite în index.css, cu variante light/dark).
const SERIES = ['--color-series-1', '--color-series-2', '--color-series-3', '--color-series-4', '--color-series-5']
const MAX_SLICES = SERIES.length

const SIZE = 180
const RADIUS = 80
const THICKNESS = 30
const CENTER = SIZE / 2

/** Punct pe cerc pentru un unghi (0 = sus, sensul acelor de ceasornic). */
function point(angle: number, radius: number) {
  return [CENTER + radius * Math.sin(angle), CENTER - radius * Math.cos(angle)]
}

/** Calea SVG a unei felii de inel între două unghiuri. */
function arcPath(start: number, end: number) {
  const outer = RADIUS
  const inner = RADIUS - THICKNESS
  const large = end - start > Math.PI ? 1 : 0
  const [x1, y1] = point(start, outer)
  const [x2, y2] = point(end, outer)
  const [x3, y3] = point(end, inner)
  const [x4, y4] = point(start, inner)
  return `M${x1} ${y1}A${outer} ${outer} 0 ${large} 1 ${x2} ${y2}L${x3} ${y3}A${inner} ${inner} 0 ${large} 0 ${x4} ${y4}Z`
}

/**
 * Grafic donut (pie cu centru gol) pentru părți dintr-un întreg (max. 5 categorii + „Altele”).
 * Identitatea nu depinde doar de culoare: legenda arată mereu eticheta, valoarea și procentul.
 * Între felii există un spațiu de 2px (contur în culoarea fundalului).
 */
export default function DonutChart({ data, centerLabel, formatValue, formatPercent }: DonutChartProps) {
  const [active, setActive] = useState<string | null>(null)
  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total === 0) return null

  // Culoarea: categoriile primesc pe rând culorile 1–5; „Altele” primește gri.
  // Unghiurile: fiecare felie începe unde s-a terminat cea dinainte (sumă cumulată, fără variabile modificate).
  const slices = data.map((d, index) => {
    const colorIndex = data.slice(0, index).filter((prev) => !prev.other).length
    const color = d.other ? 'var(--color-series-other)' : `var(${SERIES[Math.min(colorIndex, MAX_SLICES - 1)]})`
    const share = d.value / total
    const before = data.slice(0, index).reduce((sum, prev) => sum + prev.value, 0) / total
    const start = before * Math.PI * 2
    return { ...d, color, share, start, end: start + share * Math.PI * 2 }
  })

  const highlighted = slices.find((s) => s.key === active)

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-44 w-44 shrink-0"
        role="img"
        aria-label={slices.map((s) => `${s.label}: ${formatValue(s.value)} (${formatPercent(s.share)})`).join(', ')}
      >
        {slices.length === 1 ? (
          <circle cx={CENTER} cy={CENTER} r={RADIUS - THICKNESS / 2} fill="none" stroke={slices[0].color} strokeWidth={THICKNESS} />
        ) : (
          slices.map((s) => (
            <path
              key={s.key}
              d={arcPath(s.start, s.end)}
              fill={s.color}
              stroke="var(--color-surface)"
              strokeWidth={2}
              opacity={active && active !== s.key ? 0.35 : 1}
              className="transition-opacity"
              onMouseEnter={() => setActive(s.key)}
              onMouseLeave={() => setActive(null)}
            />
          ))
        )}
        {/* Centrul: totalul sau felia evidențiată */}
        <text x={CENTER} y={CENTER - 2} textAnchor="middle" className="fill-gray-900 text-[22px] font-bold tabular-nums">
          {highlighted ? formatPercent(highlighted.share) : formatValue(total)}
        </text>
        <text x={CENTER} y={CENTER + 18} textAnchor="middle" className="fill-gray-500 text-[11px]">
          {highlighted ? highlighted.label.slice(0, 18) : centerLabel}
        </text>
      </svg>

      {/* Legenda: mereu prezentă, cu etichete și valori (nu doar culori) */}
      <ul className="w-full min-w-0 space-y-1.5 text-sm">
        {slices.map((s) => (
          <li
            key={s.key}
            onMouseEnter={() => setActive(s.key)}
            onMouseLeave={() => setActive(null)}
            className={`flex items-center gap-2 rounded-md px-1.5 py-1 transition ${active === s.key ? 'bg-gray-100' : ''}`}
          >
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: s.color }} aria-hidden="true" />
            {/* etichetele lungi trec pe rândul următor (nu se taie) */}
            <span className="min-w-0 flex-1 leading-snug text-gray-700">{s.label}</span>
            <span className="tabular-nums text-gray-900">{formatValue(s.value)}</span>
            <span className="w-12 text-right tabular-nums text-gray-500">{formatPercent(s.share)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
