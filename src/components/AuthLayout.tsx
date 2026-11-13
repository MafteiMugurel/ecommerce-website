import type { ReactNode } from 'react'

export const authInputClass =
  'mt-1 block w-full rounded-lg border border-gray-300 bg-surface px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
}

/** Cadrul comun pentru paginile de autentificare și creare cont. */
export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <section className="mx-auto flex max-w-md flex-col px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-gray-200 bg-surface p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  )
}
