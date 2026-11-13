import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'
import AdminNav from '../components/admin/AdminNav'
import ProductImage from '../components/ProductImage'
import { useCategories } from '../hooks/useCategories'
import { useCategoryLabel } from '../i18n/useCategoryLabel'
import { getProducts, nextProductId, saveProduct } from '../services/productService'
import type { Product, ProductSpec } from '../types/product'
import { categoryImage } from '../utils/productImage'

/** Valorile formularului – toate ca text, cum vin din câmpuri. */
interface FormState {
  name: string
  brand: string
  category: string
  price: string
  stock: string
  description: string
  imageUrl: string
  creditAuthor: string
  creditLicense: string
  creditLicenseUrl: string
  creditSourceUrl: string
  creditSourceName: string
  representative: boolean
  specs: ProductSpec[]
}

const EMPTY_FORM: FormState = {
  name: '',
  brand: '',
  category: '',
  price: '',
  stock: '0',
  description: '',
  imageUrl: '',
  creditAuthor: '',
  creditLicense: '',
  creditLicenseUrl: '',
  creditSourceUrl: '',
  creditSourceName: '',
  representative: false,
  specs: [{ name: '', value: '' }],
}

function toForm(product: Product): FormState {
  const isLocalIllustration = product.imageUrl.startsWith('/images/categories/')
  return {
    name: product.name,
    brand: product.brand,
    category: product.category,
    price: String(product.price),
    stock: String(product.stock),
    description: product.description,
    imageUrl: isLocalIllustration ? '' : product.imageUrl,
    creditAuthor: product.imageCredit?.author ?? '',
    creditLicense: product.imageCredit?.license ?? '',
    creditLicenseUrl: product.imageCredit?.licenseUrl ?? '',
    creditSourceUrl: product.imageCredit?.sourceUrl ?? '',
    creditSourceName: product.imageCredit?.sourceName ?? '',
    representative: product.imageCredit?.representative ?? false,
    specs: product.specs.length ? product.specs.map((s) => ({ ...s })) : [{ name: '', value: '' }],
  }
}

type ValidationKey = 'required' | 'price' | 'stock' | 'imageUrl' | 'specs'

function validate(form: FormState): ValidationKey | null {
  if (!form.name.trim() || !form.brand.trim() || !form.category || !form.description.trim()) return 'required'
  const price = Number(form.price.replace(',', '.'))
  if (!Number.isFinite(price) || price <= 0) return 'price'
  if (!/^\d+$/.test(form.stock.trim())) return 'stock'
  const url = form.imageUrl.trim()
  if (url && !url.startsWith('https://') && !url.startsWith('/')) return 'imageUrl'
  if (form.specs.some((s) => (s.name.trim() === '') !== (s.value.trim() === ''))) return 'specs'
  return null
}

const inputClass =
  'mt-1 block w-full rounded-lg border border-gray-300 bg-surface px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {children}
      {hint && <span className="mt-1 block text-xs font-normal text-gray-500">{hint}</span>}
    </label>
  )
}

export default function AdminProductFormPage() {
  const { t } = useTranslation()
  const categoryLabel = useCategoryLabel()
  const { categories } = useCategories()
  const navigate = useNavigate()
  const { productId } = useParams()
  const isNew = !productId

  const [existing, setExisting] = useState<Product | null>(null)
  const [newId, setNewId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<ValidationKey | 'save' | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    getProducts()
      .then((products) => {
        if (!active) return
        if (isNew) {
          setNewId(nextProductId(products))
          return
        }
        const product = products.find((p) => p.id === productId)
        if (!product) {
          setNotFound(true)
          return
        }
        setExisting(product)
        setForm(toForm(product))
      })
      .catch(() => {
        if (active) setError('save')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [isNew, productId])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function updateSpec(index: number, key: keyof ProductSpec, value: string) {
    setForm((current) => ({
      ...current,
      specs: current.specs.map((spec, i) => (i === index ? { ...spec, [key]: value } : spec)),
    }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const problem = validate(form)
    if (problem) {
      setError(problem)
      return
    }
    const id = existing?.id ?? newId
    if (!id) return

    const imageUrl = form.imageUrl.trim() || categoryImage(form.category)
    const hasCredit = form.imageUrl.trim() && (form.creditAuthor.trim() || form.creditSourceUrl.trim())
    const product: Product = {
      id,
      name: form.name.trim(),
      brand: form.brand.trim(),
      description: form.description.trim(),
      price: Math.round(Number(form.price.replace(',', '.')) * 100) / 100,
      currency: existing?.currency ?? 'RON',
      category: form.category,
      imageUrl,
      imageCredit: hasCredit
        ? {
            author: form.creditAuthor.trim(),
            license: form.creditLicense.trim(),
            licenseUrl: form.creditLicenseUrl.trim() || null,
            sourceUrl: form.creditSourceUrl.trim(),
            sourceName: form.creditSourceName.trim() || 'Wikimedia Commons',
            ...(form.representative ? { representative: true } : {}),
          }
        : undefined,
      stock: Number(form.stock.trim()),
      rating: existing?.rating ?? 0,
      specs: form.specs
        .map((s) => ({ name: s.name.trim(), value: s.value.trim() }))
        .filter((s) => s.name && s.value),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    }

    setSaving(true)
    setError(null)
    try {
      await saveProduct(product)
      navigate('/admin/produse')
    } catch {
      setError('save')
      setSaving(false)
    }
  }

  if (loading) return <p className="mx-auto max-w-4xl px-4 py-8 text-gray-500 sm:px-6">{t('common.loading')}</p>

  if (notFound) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('productForm.notFound')}</h1>
        <Link to="/admin/produse" className="mt-4 inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
          {t('productForm.back')}
        </Link>
      </section>
    )
  }

  const previewSrc = form.imageUrl.trim() || (form.category ? categoryImage(form.category) : '')
  const sectionClass = 'space-y-4 rounded-2xl border border-gray-200 bg-surface p-6'

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <div className="space-y-3">
        <AdminNav />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {isNew ? t('productForm.newTitle') : t('productForm.editTitle')}
          </h1>
          <p className="font-mono text-sm text-gray-500">
            {t('productForm.code', { id: (existing?.id ?? newId ?? '').toUpperCase() })}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Informații generale */}
        <section className={sectionClass}>
          <h2 className="font-semibold text-gray-900">{t('productForm.general')}</h2>
          <Field label={t('productForm.name')}>
            <input value={form.name} onChange={(e) => update('name', e.target.value)} maxLength={200} className={inputClass} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('productForm.brand')}>
              <input value={form.brand} onChange={(e) => update('brand', e.target.value)} maxLength={80} className={inputClass} />
            </Field>
            <Field label={t('productForm.category')}>
              <select value={form.category} onChange={(e) => update('category', e.target.value)} className={inputClass}>
                <option value="">{t('productForm.chooseCategory')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {categoryLabel(c.id)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('productForm.price')}>
              <input
                inputMode="decimal"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label={t('productForm.stock')}>
              <input
                inputMode="numeric"
                value={form.stock}
                onChange={(e) => update('stock', e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label={t('productForm.description')}>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
              maxLength={1000}
              className={inputClass}
            />
          </Field>
        </section>

        {/* Imagine */}
        <section className={sectionClass}>
          <h2 className="font-semibold text-gray-900">{t('productForm.image')}</h2>
          <div className="grid gap-6 sm:grid-cols-[1fr_10rem]">
            <div className="space-y-4">
              <Field label={t('productForm.imageUrl')} hint={t('productForm.imageUrlHint')}>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => update('imageUrl', e.target.value)}
                  placeholder="https://upload.wikimedia.org/..."
                  className={inputClass}
                />
              </Field>
              {form.imageUrl.trim() && (
                <fieldset className="space-y-3 rounded-xl border border-gray-200 p-4">
                  <legend className="px-1 text-sm font-medium text-gray-700">{t('productForm.credit')}</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label={t('productForm.creditAuthor')}>
                      <input value={form.creditAuthor} onChange={(e) => update('creditAuthor', e.target.value)} className={inputClass} />
                    </Field>
                    <Field label={t('productForm.creditLicense')}>
                      <input
                        value={form.creditLicense}
                        onChange={(e) => update('creditLicense', e.target.value)}
                        placeholder="CC BY-SA 4.0"
                        className={inputClass}
                      />
                    </Field>
                    <Field label={t('productForm.creditSourceUrl')}>
                      <input type="url" value={form.creditSourceUrl} onChange={(e) => update('creditSourceUrl', e.target.value)} className={inputClass} />
                    </Field>
                    <Field label={t('productForm.creditLicenseUrl')}>
                      <input type="url" value={form.creditLicenseUrl} onChange={(e) => update('creditLicenseUrl', e.target.value)} className={inputClass} />
                    </Field>
                    <Field label={t('productForm.creditSourceName')}>
                      <input
                        value={form.creditSourceName}
                        onChange={(e) => update('creditSourceName', e.target.value)}
                        placeholder="Wikimedia Commons"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.representative}
                      onChange={(e) => update('representative', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 accent-indigo-600"
                    />
                    {t('productForm.representative')}
                  </label>
                </fieldset>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">{t('productForm.preview')}</p>
              {previewSrc ? (
                <ProductImage
                  key={previewSrc}
                  src={previewSrc}
                  fallbackSrc={form.category ? categoryImage(form.category) : undefined}
                  className="mt-1 aspect-square w-full rounded-xl border border-gray-200 bg-gray-100 object-contain"
                />
              ) : (
                <div className="mt-1 aspect-square w-full rounded-xl border border-dashed border-gray-300" />
              )}
            </div>
          </div>
        </section>

        {/* Specificații */}
        <section className={sectionClass}>
          <h2 className="font-semibold text-gray-900">{t('productForm.specs')}</h2>
          <ul className="space-y-2">
            {form.specs.map((spec, index) => (
              <li key={index} className="flex items-center gap-2">
                <input
                  value={spec.name}
                  onChange={(e) => updateSpec(index, 'name', e.target.value)}
                  placeholder={t('productForm.specName')}
                  aria-label={`${t('productForm.specName')} ${index + 1}`}
                  className={`${inputClass} mt-0 w-2/5`}
                />
                <input
                  value={spec.value}
                  onChange={(e) => updateSpec(index, 'value', e.target.value)}
                  placeholder={t('productForm.specValue')}
                  aria-label={`${t('productForm.specValue')} ${index + 1}`}
                  className={`${inputClass} mt-0 flex-1`}
                />
                <button
                  type="button"
                  onClick={() => update('specs', form.specs.filter((_, i) => i !== index))}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                  aria-label={t('productForm.removeSpec')}
                  title={t('productForm.removeSpec')}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => update('specs', [...form.specs, { name: '', value: '' }])}
            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            + {t('productForm.addSpec')}
          </button>
        </section>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error === 'save' ? t('productForm.saveError') : t(`productForm.errors.${error}`)}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-wait disabled:bg-indigo-400"
          >
            {saving ? t('productForm.saving') : t('productForm.save')}
          </button>
          <Link
            to="/admin/produse"
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            {t('productForm.cancel')}
          </Link>
        </div>
      </form>
    </div>
  )
}
