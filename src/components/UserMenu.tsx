import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useAuth } from '../context/authContext'

const iconButtonClass = 'relative rounded-full p-2 text-gray-700 transition hover:bg-gray-100'

function UserIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </svg>
  )
}

export default function UserMenu() {
  const { user, initializing, isAdmin, logout } = useAuth()
  const { pathname, search } = useLocation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Închide meniul la click în afara lui sau la Escape
  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  // Cât timp Firebase verifică sesiunea, afișăm un loc gol (fără „clipire” între logat / nelogat)
  if (initializing) {
    return <span className="block h-10 w-10" aria-hidden="true" />
  }

  if (!user) {
    // După autentificare, utilizatorul revine pe pagina curentă
    const onAuthPage = pathname === '/autentificare' || pathname === '/cont-nou'
    return (
      <Link
        to="/autentificare"
        state={onAuthPage ? undefined : { from: pathname + search }}
        className={`${iconButtonClass} flex items-center gap-2`}
        aria-label="Intră în cont"
        title="Intră în cont"
      >
        <UserIcon />
        <span className="hidden text-sm font-medium xl:inline">Intră în cont</span>
      </Link>
    )
  }

  const initial = user.displayName.charAt(0).toUpperCase()

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full p-1 pr-2 text-gray-700 transition hover:bg-gray-100"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Contul meu (${user.displayName})`}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
          {initial}
        </span>
        <span className="hidden max-w-32 truncate text-sm font-medium xl:inline">{user.displayName}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-surface shadow-lg"
        >
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-gray-900">{user.displayName}</p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
          {isAdmin && (
            <Link
              to="/admin"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block border-b border-gray-100 px-4 py-2.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-gray-100"
            >
              Panou admin
            </Link>
          )}
          <Link
            to="/comenzile-mele"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            Comenzile mele
          </Link>
          <Link
            to="/favorite"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            Favoritele mele
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              void logout()
            }}
            className="block w-full border-t border-gray-100 px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100"
          >
            Deconectare
          </button>
        </div>
      )}
    </div>
  )
}
