import { useTranslation } from 'react-i18next'
import type { Order } from '../types/order'

/** Adresa de livrare și metoda de plată ale unei comenzi (dacă au fost completate). */
export default function OrderShippingSummary({ order }: { order: Order }) {
  const { t } = useTranslation()
  if (!order.shipping && !order.paymentMethod) return null

  return (
    <dl className="grid gap-4 text-left text-sm sm:grid-cols-2">
      {order.shipping && (
        <div>
          <dt className="text-gray-500">{t('orderDetails.deliveryTo')}</dt>
          <dd className="mt-0.5 text-gray-900">
            {order.shipping.name}
            <br />
            {order.shipping.address}
            <br />
            {order.shipping.city}, {order.shipping.county}
            <br />
            <span className="text-gray-600">{order.shipping.phone}</span>
          </dd>
        </div>
      )}
      {order.paymentMethod && (
        <div>
          <dt className="text-gray-500">{t('orderDetails.paymentMethod')}</dt>
          <dd className="mt-0.5 text-gray-900">{t(`payment.${order.paymentMethod}`)}</dd>
        </div>
      )}
    </dl>
  )
}
