import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '../i18n'

/** Selector de limbă în header (RO / EN). Alegerea se salvează în browser. */
export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation()

  return (
    <label className="relative flex items-center rounded-full text-gray-700 transition hover:bg-gray-100" title={t('header.language')}>
      <span className="sr-only">{t('header.language')}</span>
      {/* glob */}
      <svg
        className="pointer-events-none absolute left-2 h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
        />
      </svg>
      <select
        value={i18n.resolvedLanguage}
        onChange={(event) => void i18n.changeLanguage(event.target.value)}
        className="cursor-pointer appearance-none rounded-full bg-transparent py-2 pl-8 pr-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
      >
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code} className="bg-surface text-gray-900">
            {language.short}
          </option>
        ))}
      </select>
    </label>
  )
}
