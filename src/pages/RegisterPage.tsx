import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import AuthLayout, { authInputClass } from '../components/AuthLayout'
import GoogleSignInButton from '../components/GoogleSignInButton'
import { useAuth } from '../context/authContext'
import { getAuthErrorMessage, MIN_PASSWORD_LENGTH } from '../services/authService'

export default function RegisterPage() {
  const { t } = useTranslation()
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/'
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user && !submitting) return <Navigate to={from} replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '')
    const password = String(data.get('password') ?? '')
    const confirm = String(data.get('confirm') ?? '')

    if (name.length < 2) {
      setError(t('auth.nameTooShort'))
      return
    }
    if (password !== confirm) {
      setError(t('auth.passwordMismatch'))
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await register(name, email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title={t('auth.registerTitle')} subtitle={t('auth.registerSubtitle')}>
      <GoogleSignInButton redirectTo={from} onPendingChange={setSubmitting} onError={setError} />
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
        <label className="block text-sm font-medium text-gray-700">
          {t('auth.name')}
          <input name="name" autoComplete="name" required maxLength={50} className={authInputClass} />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          {t('auth.email')}
          <input name="email" type="email" autoComplete="email" required className={authInputClass} />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          {t('auth.password')}
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            className={authInputClass}
          />
          <span className="mt-1 block text-xs font-normal text-gray-500">{t('auth.passwordHint', { count: MIN_PASSWORD_LENGTH })}</span>
        </label>
        <label className="block text-sm font-medium text-gray-700">
          {t('auth.confirmPassword')}
          <input name="confirm" type="password" autoComplete="new-password" required className={authInputClass} />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-wait disabled:bg-indigo-400"
        >
          {submitting ? t('auth.creating') : t('auth.registerButton')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        {t('auth.haveAccount')}{' '}
        <Link to="/autentificare" state={{ from }} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
          {t('auth.loginButton')}
        </Link>
      </p>
    </AuthLayout>
  )
}
