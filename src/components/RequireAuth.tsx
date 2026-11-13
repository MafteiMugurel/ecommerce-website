import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../context/authContext'

interface RequireAuthProps {
  children: ReactNode
  /** dacă e true, pagina e accesibilă doar adminilor */
  admin?: boolean
}

/** Protejează o pagină: cere autentificare (și, opțional, rol de admin). */
export default function RequireAuth({ children, admin = false }: RequireAuthProps) {
  const { t } = useTranslation()
  const { user, initializing, isAdmin, checkingAdmin } = useAuth()
  const { pathname, search } = useLocation()

  if (initializing || (admin && checkingAdmin)) {
    return <p className="mx-auto max-w-7xl px-4 py-8 text-gray-500 sm:px-6 lg:px-8">{t('access.checking')}</p>
  }

  if (!user) {
    return <Navigate to="/autentificare" replace state={{ from: pathname + search }} />
  }

  if (admin && !isAdmin) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('access.forbiddenTitle')}</h1>
        <p className="mt-2 text-gray-600">{t('access.forbiddenText')}</p>
      </section>
    )
  }

  return children
}
