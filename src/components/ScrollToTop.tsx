import { useEffect } from 'react'
import { useLocation } from 'react-router'

/** La schimbarea paginii, derulează în partea de sus (ex. click pe un produs similar). */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
