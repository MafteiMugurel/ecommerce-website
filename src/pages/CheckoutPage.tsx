import { useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import ProductImage from '../components/ProductImage'
import { useAuth } from '../context/authContext'
import { useCart } from '../context/cartContext'
import { COUNTIES } from '../data/romania'
import { placeOrder } from '../services/orderService'
import { PAYMENT_METHODS, type PaymentMethod, type ShippingInfo } from '../types/order'
import { formatPrice } from '../utils/format'
import { categoryImage } from '../utils/productImage'

type FieldError = 'name' | 'phone' | 'email' | 'county' | 'city' | 'address'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Număr românesc: 07xx xxx xxx, 02x/03x fix, opțional cu prefixul +40
const PHONE_PATTERN = /^(\+?40|0)\d{9}$/

/** Validarea câmpurilor de livrare – aceleași limite ca regulile Firestore. */
function validate(shipping: ShippingInfo): FieldError[] {
  const errors: FieldError[] = []
  if (shipping.name.trim().length < 3) errors.push('name')
  if (!PHONE_PATTERN.test(shipping.phone.replace(/[\s.-]/g, ''))) errors.push('phone')
  if (!EMAIL_PATTERN.test(shipping.email.trim())) errors.push('email')
  if (!shipping.county) errors.push('county')
  if (shipping.city.trim().length < 2) errors.push('city')
  if (shipping.address.trim().length < 5) errors.push('address')
  return errors
}

const inputClass = (invalid: boolean) =>
  `mt-1 block w-full rounded-lg border bg-surface px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 ${
    invalid ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
  }`

/** Indicatorul de pași: Coș → Livrare și plată → Confirmare. */
function Steps() {
  const { t } = useTranslation()
  const steps = [t('checkout.stepCart'), t('checkout.stepDetails'), t('checkout.stepDone')]
  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {steps.map((label, index) => {
        const done = index === 0
        const current = index === 1
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                current ? 'bg-indigo-600 text-white' : done ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
              aria-hidden="true"
            >
              {done ? '✓' : index + 1}
            </span>
            <span className={current ? 'font-semibold text-gray-900' : 'text-gray-500'} aria-current={current ? 'step' : undefined}>
              {label}
            </span>
            {index < steps.length - 1 && <span className="mx-1 text-gray-300" aria-hidden="true">→</span>}
          </li>
        )
      })}
    </ol>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {children}
      {error && <span className="mt-1 block text-xs font-normal text-red-600 dark:text-red-400">{error}</span>}
    </label>
  )
}

export default function CheckoutPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items, totalPrice, totalItems, clearCart, openCart } = useCart()

  // Pentru utilizatorii logați, numele și emailul se completează din cont
  const [shipping, setShipping] = useState<ShippingInfo>({
    name: user?.displayName ?? '',
    phone: '',
    email: user?.email ?? '',
    county: '',
    city: '',
    address: '',
  })
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [errors, setErrors] = useState<FieldError[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [orderError, setOrderError] = useState(false)

  function update(key: keyof ShippingInfo, value: string) {
    const next = { ...shipping, [key]: value }
    setShipping(next)
    if (submitted) setErrors(validate(next)) // după prima încercare, erorile se actualizează pe loc
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    const found = validate(shipping)
    setErrors(found)
    if (found.length) return

    setPlacing(true)
    setOrderError(false)
    try {
      const cleaned: ShippingInfo = {
        name: shipping.name.trim(),
        phone: shipping.phone.replace(/[\s.-]/g, ''),
        email: shipping.email.trim(),
        county: shipping.county,
        city: shipping.city.trim(),
        address: shipping.address.trim(),
      }
      const order = await placeOrder(items, user?.uid ?? null, cleaned, paymentMethod)
      clearCart()
      navigate('/comanda-finalizata', { state: { order }, replace: true })
    } catch {
      setOrderError(true)
      setPlacing(false)
    }
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <p className="text-gray-600">{t('checkout.emptyCart')}</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {t('common.seeProducts')}
        </Link>
      </section>
    )
  }

  const errorText = (field: FieldError) => (errors.includes(field) ? t(`checkout.errors.${field}`) : undefined)
  const sectionClass = 'space-y-4 rounded-2xl border border-gray-200 bg-surface p-6'

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <Steps />
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t('checkout.title')}</h1>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-6">
          {/* Livrare */}
          <section className={sectionClass} aria-labelledby="checkout-shipping">
            <h2 id="checkout-shipping" className="font-semibold text-gray-900">
              {t('checkout.shipping')}
            </h2>
            <Field label={t('checkout.name')} error={errorText('name')}>
              <input
                value={shipping.name}
                onChange={(e) => update('name', e.target.value)}
                autoComplete="name"
                maxLength={100}
                aria-invalid={errors.includes('name')}
                className={inputClass(errors.includes('name'))}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('checkout.phone')} error={errorText('phone')}>
                <input
                  type="tel"
                  value={shipping.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  autoComplete="tel"
                  placeholder="07xx xxx xxx"
                  maxLength={20}
                  aria-invalid={errors.includes('phone')}
                  className={inputClass(errors.includes('phone'))}
                />
              </Field>
              <Field label={t('checkout.email')} error={errorText('email')}>
                <input
                  type="email"
                  value={shipping.email}
                  onChange={(e) => update('email', e.target.value)}
                  autoComplete="email"
                  maxLength={200}
                  aria-invalid={errors.includes('email')}
                  className={inputClass(errors.includes('email'))}
                />
              </Field>
              <Field label={t('checkout.county')} error={errorText('county')}>
                <select
                  value={shipping.county}
                  onChange={(e) => update('county', e.target.value)}
                  autoComplete="address-level1"
                  aria-invalid={errors.includes('county')}
                  className={inputClass(errors.includes('county'))}
                >
                  <option value="">{t('checkout.chooseCounty')}</option>
                  {COUNTIES.map((county) => (
                    <option key={county} value={county}>
                      {county}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('checkout.city')} error={errorText('city')}>
                <input
                  value={shipping.city}
                  onChange={(e) => update('city', e.target.value)}
                  autoComplete="address-level2"
                  maxLength={100}
                  aria-invalid={errors.includes('city')}
                  className={inputClass(errors.includes('city'))}
                />
              </Field>
            </div>
            <Field label={t('checkout.address')} error={errorText('address')}>
              <input
                value={shipping.address}
                onChange={(e) => update('address', e.target.value)}
                autoComplete="street-address"
                maxLength={200}
                aria-invalid={errors.includes('address')}
                className={inputClass(errors.includes('address'))}
              />
            </Field>
          </section>

          {/* Plată */}
          <fieldset className={sectionClass}>
            <legend className="sr-only">{t('checkout.payment')}</legend>
            <h2 className="font-semibold text-gray-900" aria-hidden="true">
              {t('checkout.payment')}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {PAYMENT_METHODS.map((method) => {
                const selected = paymentMethod === method
                return (
                  <label
                    key={method}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                      selected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={selected}
                      onChange={() => setPaymentMethod(method)}
                      className="mt-0.5 h-4 w-4 accent-indigo-600"
                    />
                    <span>
                      <span className="block text-sm font-medium text-gray-900">{t(`payment.${method}`)}</span>
                      <span className="block text-xs text-gray-500">{t(`payment.${method}Hint`)}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        </div>

        {/* Sumar */}
        <aside className={`${sectionClass} h-fit lg:sticky lg:top-24`} aria-labelledby="checkout-summary">
          <h2 id="checkout-summary" className="font-semibold text-gray-900">
            {t('checkout.summary')}
          </h2>
          <ul className="divide-y divide-gray-100">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex items-center gap-3 py-2.5">
                <ProductImage
                  src={product.imageUrl}
                  fallbackSrc={categoryImage(product.category)}
                  className="h-12 w-12 shrink-0 rounded-lg bg-gray-100 object-contain"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">
                    {quantity} × {formatPrice(product.price, product.currency)}
                  </p>
                </div>
                <span className="text-sm font-medium tabular-nums text-gray-900">
                  {formatPrice(product.price * quantity, product.currency)}
                </span>
              </li>
            ))}
          </ul>
          <div className="space-y-1 border-t border-gray-200 pt-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>{t('common.products', { count: totalItems })}</span>
              <span className="tabular-nums">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{t('checkout.shippingFree')}</span>
              <span className="text-green-600 dark:text-green-400">{t('checkout.free')}</span>
            </div>
            <div className="flex justify-between pt-1 text-base font-semibold text-gray-900">
              <span>{t('checkout.total')}</span>
              <span className="tabular-nums">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          {orderError && (
            <p role="alert" className="rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              {t('checkout.errors.order')}
            </p>
          )}

          <button
            type="submit"
            disabled={placing}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:bg-indigo-400"
          >
            {placing ? t('checkout.placing') : t('checkout.placeOrder')}
          </button>
          <button type="button" onClick={openCart} className="w-full text-sm text-gray-500 hover:text-gray-700 hover:underline">
            {t('checkout.backToCart')}
          </button>
        </aside>
      </form>
    </div>
  )
}
