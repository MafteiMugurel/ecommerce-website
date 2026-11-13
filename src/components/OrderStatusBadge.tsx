import { ORDER_STATUS_LABELS, type OrderStatus } from '../types/order'

// Fiecare status are text + culoare (culoarea nu e singurul indiciu).
const STATUS_CLASSES: Record<OrderStatus, string> = {
  placed: 'bg-gray-100 text-gray-700',
  processing: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  shipped: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300',
}

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  )
}
