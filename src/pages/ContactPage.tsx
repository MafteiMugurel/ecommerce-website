import { useState, type FormEvent } from 'react'

const inputClass =
  'mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'

export default function ContactPage() {
  const [sent, setSent] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Mock: mesajul nu se trimite nicăieri încă (mai târziu: colecția "messages" din Firestore).
    event.currentTarget.reset()
    setSent(true)
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Contact</h1>
      <p className="mt-2 text-gray-600">Ai o întrebare despre un produs sau o comandă? Scrie-ne!</p>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_2fr]">
        <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 text-sm">
          <div>
            <h2 className="font-semibold text-gray-900">Adresă</h2>
            <p className="mt-1 text-gray-600">Str. Exemplu nr. 10, București</p>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Telefon</h2>
            <p className="mt-1 text-gray-600">0700 000 000</p>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Email</h2>
            <p className="mt-1 text-gray-600">contact@itshop.example</p>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Program</h2>
            <p className="mt-1 text-gray-600">Luni – Vineri: 09:00 – 18:00</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6">
          {sent && (
            <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              Mulțumim! Mesajul tău a fost trimis. Te contactăm în cel mai scurt timp.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Nume
              <input name="name" required className={inputClass} />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Email
              <input name="email" type="email" required className={inputClass} />
            </label>
          </div>
          <label className="block text-sm font-medium text-gray-700">
            Subiect
            <input name="subject" required className={inputClass} />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Mesaj
            <textarea name="message" rows={5} required className={inputClass} />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Trimite mesajul
          </button>
        </form>
      </div>
    </section>
  )
}
