import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition ${
    isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'
  }`

/** Tab-urile panoului de administrare: Dashboard | Comenzi | Clienți | Produse. */
export default function AdminNav() {
  const { t } = useTranslation()

  return (
    <nav
      aria-label={t('adminNav.label')}
      className="inline-flex max-w-full flex-wrap rounded-lg border border-gray-200 bg-surface p-0.5"
    >
      <NavLink to="/admin" end className={tabClass}>
        {t('adminNav.dashboard')}
      </NavLink>
      <NavLink to="/admin/comenzi" className={tabClass}>
        {t('adminNav.orders')}
      </NavLink>
      <NavLink to="/admin/clienti" className={tabClass}>
        {t('adminNav.customers')}
      </NavLink>
      <NavLink to="/admin/produse" className={tabClass}>
        {t('adminNav.products')}
      </NavLink>
    </nav>
  )
}
