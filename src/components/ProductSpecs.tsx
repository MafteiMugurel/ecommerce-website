import { useTranslation } from 'react-i18next'
import { useCategoryLabel } from '../i18n/useCategoryLabel'
import type { Product } from '../types/product'

export default function ProductSpecs({ product }: { product: Product }) {
  const { t } = useTranslation()
  const categoryLabel = useCategoryLabel()
  // Rânduri generale, urmate de specificațiile tehnice ale produsului
  const rows = [
    { name: t('product.manufacturer'), value: product.brand },
    { name: t('product.category'), value: categoryLabel(product.category) },
    { name: t('product.code'), value: product.id.toUpperCase() },
    ...product.specs,
  ]

  return (
    <section id="specificatii" className="scroll-mt-24">
      <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{t('product.details')}</h2>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_2fr]">
        <div>
          <h3 className="font-semibold text-gray-900">{t('product.description')}</h3>
          <p className="mt-2 leading-relaxed text-gray-700">{product.description}</p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900">{t('product.specs')}</h3>
          <div className="mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-surface">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={row.name} className="even:bg-gray-50">
                    <th scope="row" className="w-2/5 px-4 py-3 align-top font-medium text-gray-500">
                      {row.name}
                    </th>
                    <td className="px-4 py-3 text-gray-900">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
