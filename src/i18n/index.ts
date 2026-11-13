import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en'
import ro from './locales/ro'

export const LANGUAGES = [
  { code: 'ro', label: 'Română', short: 'RO', locale: 'ro-RO' },
  { code: 'en', label: 'English', short: 'EN', locale: 'en-US' },
] as const

export type LanguageCode = (typeof LANGUAGES)[number]['code']

const STORAGE_KEY = 'language'
const DEFAULT_LANGUAGE: LanguageCode = 'ro'

function isLanguage(value: string | null | undefined): value is LanguageCode {
  return LANGUAGES.some((language) => language.code === value)
}

/** Limba salvată de utilizator; altfel limba browserului, dacă e suportată; altfel româna. */
function detectLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLanguage(saved)) return saved
  } catch {
    // stocarea poate fi indisponibilă
  }
  const browser = navigator.language?.slice(0, 2)
  return isLanguage(browser) ? browser : DEFAULT_LANGUAGE
}

void i18n.use(initReactI18next).init({
  resources: { ro: { translation: ro }, en: { translation: en } },
  lng: detectLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false }, // React escapează deja textul
})

// Atributul lang de pe <html> ajută cititoarele de ecran și traducerea automată a browserului
document.documentElement.lang = i18n.language
i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language
  try {
    localStorage.setItem(STORAGE_KEY, language)
  } catch {
    // ignorăm – limba se aplică doar în sesiunea curentă
  }
})

/** Locale-ul Intl (ro-RO / en-US) pentru limba curentă – folosit la formatarea prețurilor și datelor. */
export function currentLocale(): string {
  return LANGUAGES.find((language) => language.code === i18n.language)?.locale ?? 'ro-RO'
}

export default i18n
