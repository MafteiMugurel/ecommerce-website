import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import AuthLayout, { authInputClass } from '../components/AuthLayout'
import GoogleSignInButton from '../components/GoogleSignInButton'
import { useAuth } from '../context/authContext'
import { getAuthErrorMessage } from '../services/authService'

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  // Pagina de unde a venit utilizatorul – după autentificare îl ducem înapoi acolo
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/'
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user && !submitting) return <Navigate to={from} replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setSubmitting(true)
    setError(null)
    try {
      await login(String(data.get('email') ?? ''), String(data.get('password') ?? ''))
      navigate(from, { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Intră în cont" subtitle="Bine ai revenit! Introdu datele contului tău.">
      <GoogleSignInButton redirectTo={from} onPendingChange={setSubmitting} onError={setError} />
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
        <label className="block text-sm font-medium text-gray-700">
          Email
          <input name="email" type="email" autoComplete="email" required className={authInputClass} />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Parolă
          <input name="password" type="password" autoComplete="current-password" required className={authInputClass} />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-wait disabled:bg-indigo-400"
        >
          {submitting ? 'Se verifică...' : 'Intră în cont'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Nu ai cont?{' '}
        <Link to="/cont-nou" state={{ from }} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
          Creează unul
        </Link>
      </p>
    </AuthLayout>
  )
}
