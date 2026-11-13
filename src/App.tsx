import { BrowserRouter, Route, Routes } from 'react-router'
import CartDrawer from './components/CartDrawer'
import Header from './components/Header'
import ScrollToTop from './components/ScrollToTop'
import CartProvider from './context/CartProvider'
import FavoritesProvider from './context/FavoritesProvider'
import ContactPage from './pages/ContactPage'
import FavoritesPage from './pages/FavoritesPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import ProductPage from './pages/ProductPage'
import ProductsPage from './pages/ProductsPage'
import SearchPage from './pages/SearchPage'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CartProvider>
        <FavoritesProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<ProductsPage />} />
                <Route path="/categorie/:categoryId" element={<ProductsPage />} />
                <Route path="/produs/:productId" element={<ProductPage />} />
                <Route path="/cautare" element={<SearchPage />} />
                <Route path="/favorite" element={<FavoritesPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/comanda-finalizata" element={<OrderSuccessPage />} />
              </Routes>
            </main>
            <CartDrawer />
          </div>
        </FavoritesProvider>
      </CartProvider>
    </BrowserRouter>
  )
}
