import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'
import { useAuth } from '../context/authContext'
import { useCategories } from '../hooks/useCategories'
import { useCategoryLabel } from '../i18n/useCategoryLabel'

interface NavMenuProps {
  onNavigate?: () => void
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
  }`

export default function NavMenu({ onNavigate }: NavMenuProps) {
  const { t } = useTranslation()
  const categoryLabel = useCategoryLabel()
  const { categories } = useCategories()
  const { isAdmin } = useAuth()

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-1">
        <li>
          <NavLink to="/" end onClick={onNavigate} className={linkClass}>
            {t('menu.allProducts')}
          </NavLink>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <NavLink to={`/categorie/${category.id}`} onClick={onNavigate} className={linkClass}>
              {categoryLabel(category.id)}
            </NavLink>
          </li>
        ))}
      </ul>

      <ul className="flex flex-col gap-1 border-t border-gray-200 pt-4">
        {isAdmin && (
          <li>
            <NavLink to="/admin" onClick={onNavigate} className={linkClass}>
              {t('account.adminPanel')}
            </NavLink>
          </li>
        )}
        <li>
          <NavLink to="/favorite" onClick={onNavigate} className={linkClass}>
            {t('menu.favorites')}
          </NavLink>
        </li>
        <li>
          <NavLink to="/contact" onClick={onNavigate} className={linkClass}>
            {t('menu.contact')}
          </NavLink>
        </li>
      </ul>
    </div>
  )
}
