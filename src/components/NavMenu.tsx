import { NavLink } from 'react-router'
import { useCategories } from '../hooks/useCategories'

interface NavMenuProps {
  onNavigate?: () => void
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
  }`

export default function NavMenu({ onNavigate }: NavMenuProps) {
  const { categories } = useCategories()

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-1">
        <li>
          <NavLink to="/" end onClick={onNavigate} className={linkClass}>
            Toate produsele
          </NavLink>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <NavLink to={`/categorie/${category.id}`} onClick={onNavigate} className={linkClass}>
              {category.name}
            </NavLink>
          </li>
        ))}
      </ul>

      <ul className="flex flex-col gap-1 border-t border-gray-200 pt-4">
        <li>
          <NavLink to="/favorite" onClick={onNavigate} className={linkClass}>
            Favorite
          </NavLink>
        </li>
        <li>
          <NavLink to="/contact" onClick={onNavigate} className={linkClass}>
            Contact
          </NavLink>
        </li>
      </ul>
    </div>
  )
}
