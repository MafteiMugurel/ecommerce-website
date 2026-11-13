import 'i18next'
import type ro from './locales/ro'

// Chei de traducere verificate de TypeScript: t('product.addToCart') e validat la compilare,
// iar o cheie greșită (ex. t('product.addToCrat')) produce eroare de build.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: { translation: typeof ro }
  }
}
