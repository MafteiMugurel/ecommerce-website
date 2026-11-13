import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import ro from './locales/ro'

type CategoryId = keyof typeof ro.categories

// În baza de date, produsele au categoria scrisă în română (ex. „Servere”),
// iar categoriile au un id stabil (ex. „servere”). Traducerea se face după id.
const idByRomanianName = new Map(
  (Object.entries(ro.categories) as [CategoryId, string][]).map(([id, name]) => [name, id]),
)

function isCategoryId(id: string): id is CategoryId {
  return id in ro.categories
}

/**
 * Returnează o funcție care traduce o categorie după id sau după numele românesc.
 * Categoriile necunoscute (adăugate ulterior în baza de date) se afișează cu numele original.
 */
export function useCategoryLabel() {
  const { t } = useTranslation()
  return useCallback(
    (idOrName: string) => {
      const id = isCategoryId(idOrName) ? idOrName : idByRomanianName.get(idOrName)
      return id ? t(`categories.${id}`) : idOrName
    },
    [t],
  )
}
