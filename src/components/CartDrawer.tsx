import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useCart } from '../context/cartContext'
import { placeOrder } from '../services/orderService'
import { formatPrice } from '../utils/format'

export default function CartDrawer() {
  const { items, totalPrice, isOpen, closeCart, removeItem, updateQuantity, clearCart } = useCart()
  const navigate = useNavigate()
  const [placing, setPlacing] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)

  async function handleCheckout() {
    setPlacing(true)
    setOrderError(null)
    try {
      const order = await placeOrder(items)
      clearCart()
      closeCart()
      navigate('/comanda-finalizata', { state: { order } })
    } catch {
      setOrderError('Comanda nu a putut fi plasată. Încearcă din nou.')
    } finally {
      setPlacing(false)
    }
  }

  // Închidere cu tasta Escape
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCart()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, closeCart])

  return (
    <div className={`fixed inset-0 z-40 ${isOpen ? '' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-black/40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      />

      <aside
        role="dialog"
        aria-label="Coș de cumpărături"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Coșul tău</h2>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
            aria-label="Închide coșul"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-gray-500">Coșul este gol.</p>
            <button type="button" onClick={closeCart} className="text-sm font-medium text-indigo-600 hover:underline">
              Continuă cumpărăturile
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-gray-100 overflow-y-auto px-5">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex gap-4 py-4">
                  <img src={product.imageUrl} alt={product.name} className="h-20 w-20 rounded-lg object-cover" />

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatPrice(product.price * quantity, product.currency)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{formatPrice(product.price, product.currency)} / buc.</span>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-lg border border-gray-300">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="px-2.5 py-1 text-gray-600 hover:bg-gray-100"
                          aria-label="Scade cantitatea"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                          aria-label="Crește cantitatea"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(product.id)}
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Șterge
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-3 border-t border-gray-200 px-5 py-4">
              <div className="flex justify-between text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              {orderError && <p className="text-sm text-red-600">{orderError}</p>}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={placing}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-wait disabled:bg-indigo-400"
              >
                {placing ? 'Se plasează comanda...' : 'Finalizează comanda'}
              </button>
              <button
                type="button"
                onClick={clearCart}
                className="w-full text-sm text-gray-500 hover:text-gray-700 hover:underline"
              >
                Golește coșul
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
