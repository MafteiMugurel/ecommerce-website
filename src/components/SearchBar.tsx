import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

export default function SearchBar({ className = '' }: { className?: string }) {
  const [searchParams] = useSearchParams()
  const currentQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(currentQuery)
  const [syncedQuery, setSyncedQuery] = useState(currentQuery)
  const navigate = useNavigate()

  // Dacă termenul din URL se schimbă (ex. butonul Înapoi), actualizăm și câmpul.
  if (currentQuery !== syncedQuery) {
    setSyncedQuery(currentQuery)
    setQuery(currentQuery)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = query.trim()
    if (trimmed) navigate(`/cautare?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form role="search" onSubmit={handleSubmit} className={`relative ${className}`}>
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Caută produse, branduri..."
        aria-label="Caută produse"
        className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
    </form>
  )
}
