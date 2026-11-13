import { BrowserRouter, Route, Routes } from 'react-router'
import CartDrawer from './components/CartDrawer'
import Header from './components/Header'
import RequireAuth from './components/RequireAuth'
import ScrollToTop from './components/ScrollToTop'
import AuthProvider from './context/AuthProvider'
import CartProvider from './context/CartProvider'
import FavoritesProvider from './context/FavoritesProvider'
import ThemeProvider from './context/ThemeProvider'
import AdminPage from './pages/AdminPage'
import ContactPage from './pages/ContactPage'
import OrdersPage from './pages/OrdersPage'
import FavoritesPage from './pages/FavoritesPage'
import LoginPage from './pages/LoginPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import ProductPage from './pages/ProductPage'
import ProductsPage from './pages/ProductsPage'
import RegisterPage from './pages/RegisterPage'
import SearchPage from './pages/SearchPage'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <div className="min-h-screen bg-gray-50 text-gray-900">
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<ProductsPage />} />
                    <Route path="/categorie/:categoryId" element={<ProductsPage />} />
                    <Route path="/produs/:productId" element={<ProductPage />} />
                    <Route path="/cautare" element={<SearchPage />} />
                    <Route path="/favorite" element={<FavoritesPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/autentificare" element={<LoginPage />} />
                    <Route path="/cont-nou" element={<RegisterPage />} />
                    <Route path="/comanda-finalizata" element={<OrderSuccessPage />} />
                    <Route
                      path="/comenzile-mele"
                      element={
                        <RequireAuth>
                          <OrdersPage />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <RequireAuth admin>
                          <AdminPage />
                        </RequireAuth>
                      }
                    />
                  </Routes>
                </main>
                <CartDrawer />
              </div>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
