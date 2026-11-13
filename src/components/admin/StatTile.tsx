interface StatTileProps {
  label: string
  value: string
  detail?: string
}

/** O cifră-cheie: nu are nevoie de grafic, doar de etichetă și valoare. */
export default function StatTile({ label, value, detail }: StatTileProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-surface p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {detail && <p className="mt-1 text-xs text-gray-500">{detail}</p>}
    </div>
  )
}
