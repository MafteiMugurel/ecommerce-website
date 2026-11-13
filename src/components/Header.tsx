import { useCallback, useState } from 'react'
import { Link } from 'react-router'
import { useCart } from '../context/cartContext'
import { useFavorites } from '../context/favoritesContext'
import MenuDrawer from './MenuDrawer'
import SearchBar from './SearchBar'
import ThemeToggle from './ThemeToggle'
import UserMenu from './UserMenu'

function CountBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-xs font-semibold text-white">
      {count}
    </span>
  )
}

export default function Header() {
  const { totalItems, openCart } = useCart()
  const { count: favoritesCount } = useFavorites()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-surface">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex items-center gap-2 rounded-lg p-2 text-gray-700 hover:bg-gray-100"
              aria-label="Deschide meniul de categorii"
              aria-expanded={menuOpen}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              <span className="hidden text-sm font-medium lg:inline">Categorii</span>
            </button>
            <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              IT Shop
            </Link>
          </div>

          {/* Căutare – desktop/tabletă */}
          <SearchBar className="mx-auto hidden w-full max-w-xl md:block" />

          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1 md:ml-0">
            <ThemeToggle />
            <UserMenu />
            <Link
              to="/favorite"
              className="relative rounded-full p-2 text-gray-700 transition hover:bg-gray-100"
              aria-label={`Favorite (${favoritesCount} produse)`}
              title="Favorite"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
              <CountBadge count={favoritesCount} />
            </Link>

            <button
              type="button"
              onClick={openCart}
              className="relative rounded-full p-2 text-gray-700 transition hover:bg-gray-100"
              aria-label={`Deschide coșul (${totalItems} produse)`}
              title="Coș"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
              <CountBadge count={totalItems} />
            </button>
          </div>
        </div>

        {/* Căutare – mobil */}
        <div className="px-4 pb-3 md:hidden">
          <SearchBar />
        </div>
      </header>

      <MenuDrawer isOpen={menuOpen} onClose={closeMenu} />
    </>
  )
}
