import { Link, Navigate, useLocation } from 'react-router'
import type { Order } from '../types/order'
import { formatPrice } from '../utils/format'

export default function OrderSuccessPage() {
  const order = (useLocation().state as { order?: Order } | null)?.order

  // Pagina are sens doar imediat după plasarea unei comenzi.
  if (!order) return <Navigate to="/" replace />

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Felicitări pentru comandă!</h1>
        <p className="mt-2 text-gray-600">
          Comanda ta a fost plasată cu succes. Îți mulțumim că ai cumpărat de la noi!
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Număr comandă: <span className="font-mono font-semibold text-gray-900">{order.id}</span>
        </p>

        <ul className="mt-8 divide-y divide-gray-100 border-y border-gray-100 text-left">
          {order.items.map(({ product, quantity }) => (
            <li key={product.id} className="flex items-center gap-4 py-3">
              <img src={product.imageUrl} alt={product.name} className="h-14 w-14 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-500">Cantitate: {quantity}</p>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {formatPrice(product.price * quantity, product.currency)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between text-base font-semibold text-gray-900">
          <span>Total ({order.totalItems} produse)</span>
          <span>{formatPrice(order.totalPrice)}</span>
        </div>

        <Link
          to="/"
          className="mt-8 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Înapoi la produse
        </Link>
      </div>
    </section>
  )
}
