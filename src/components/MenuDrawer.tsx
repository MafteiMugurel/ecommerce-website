import { useEffect } from 'react'
import NavMenu from './NavMenu'

interface MenuDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function MenuDrawer({ isOpen, onClose }: MenuDrawerProps) {
  // Închidere cu tasta Escape
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  return (
    <div className={`fixed inset-0 z-40 ${isOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      />

      <aside
        role="dialog"
        aria-label="Meniu categorii"
        className={`absolute left-0 top-0 flex h-full w-full max-w-xs flex-col bg-surface shadow-xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Categorii</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
            aria-label="Ascunde meniul"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <NavMenu onNavigate={onClose} />
        </nav>
      </aside>
    </div>
  )
}
