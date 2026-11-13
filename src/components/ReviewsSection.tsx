import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import { useAuth } from '../context/authContext'
import { addReview, getReviews } from '../services/reviewService'
import type { Review } from '../types/review'
import StarRating from './StarRating'
import { formatDate } from '../utils/format'

const inputClass =
  'mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200'


export default function ReviewsSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const { t } = useTranslation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    let active = true
    getReviews(productId)
      .then((result) => {
        if (active) setReviews(result)
      })
      .catch(() => {
        if (active) setReviews([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [productId])

  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }))

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const author = String(data.get('author') ?? '').trim()
    const comment = String(data.get('comment') ?? '').trim()

    if (rating === 0) {
      setFormError(t('reviews.errorRating'))
      return
    }
    if (!author || !comment) {
      setFormError(t('reviews.errorFields'))
      return
    }

    if (!user) return

    setSubmitting(true)
    setFormError(null)
    try {
      const review = await addReview({ productId, userId: user.uid, author, rating, comment })
      setReviews((current) => [review, ...current])
      form.reset()
      setRating(0)
      setSubmitted(true)
    } catch {
      setFormError(t('reviews.errorSubmit'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="recenzii" className="scroll-mt-24">
      <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{t('reviews.title')}</h2>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_2fr]">
        {/* Rezumat + formular */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-surface p-6">
            {loading ? (
              <p className="text-sm text-gray-500">{t('common.loading')}</p>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-gray-900">{average.toFixed(1)}</span>
                  <div>
                    <StarRating rating={average} size="md" />
                    <p className="text-sm text-gray-500">{t('reviews.count', { count: reviews.length })}</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-1.5">
                  {distribution.map(({ stars, count }) => (
                    <li key={stars} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-12 shrink-0">{t('reviews.stars', { count: stars })}</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <span
                          className="block h-full rounded-full bg-amber-400"
                          style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }}
                        />
                      </span>
                      <span className="w-6 shrink-0 text-right">{count}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {!user ? (
            <div className="rounded-2xl border border-gray-200 bg-surface p-6 text-center">
              <h3 className="font-semibold text-gray-900">{t('reviews.write')}</h3>
              <p className="mt-2 text-sm text-gray-600">{t('reviews.loginRequired')}</p>
              <Link
                to="/autentificare"
                state={{ from: `${pathname}#recenzii` }}
                className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                {t('account.login')}
              </Link>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-200 bg-surface p-6">
            <h3 className="font-semibold text-gray-900">{t('reviews.write')}</h3>
            {submitted && (
              <p className="rounded-lg bg-green-50 dark:bg-green-950/40 px-3 py-2 text-sm text-green-700 dark:text-green-300">{t('reviews.thanks')}</p>
            )}
            {formError && <p className="rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-700 dark:text-red-300">{formError}</p>}

            <div>
              <span className="block text-sm font-medium text-gray-700">{t('reviews.yourRating')}</span>
              <div className="mt-1 flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    aria-label={t('reviews.stars', { count: value })}
                    aria-pressed={rating === value}
                    className="text-2xl leading-none transition hover:scale-110"
                  >
                    <span className={value <= (hoverRating || rating) ? 'text-amber-400' : 'text-gray-300'}>★</span>
                  </button>
                ))}
              </div>
            </div>
            <label className="block text-sm font-medium text-gray-700">
              {t('reviews.name')}
              {/* key: dacă se schimbă utilizatorul, câmpul se completează cu noul nume */}
              <input
                key={user.uid}
                name="author"
                maxLength={40}
                defaultValue={user.displayName}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              {t('reviews.comment')}
              <textarea name="comment" rows={4} maxLength={1000} className={inputClass} />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-wait disabled:bg-indigo-400"
            >
              {submitting ? t('reviews.publishing') : t('reviews.publish')}
            </button>
          </form>
          )}
        </div>

        {/* Lista de recenzii */}
        <div>
          {!loading && reviews.length === 0 && (
            <p className="text-gray-500">{t('reviews.empty')}</p>
          )}
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-2xl border border-gray-200 bg-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                      {review.author.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{review.author}</p>
                      <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="mt-3 text-sm text-gray-700">{review.comment}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
