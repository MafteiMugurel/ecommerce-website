interface StarRatingProps {
  rating: number
  size?: 'sm' | 'md'
}

/** Afișează 5 stele, umplute proporțional cu nota (ex. 4.5 → 4 stele și jumătate). */
export default function StarRating({ rating, size = 'sm' }: StarRatingProps) {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <span className="inline-flex items-center" aria-label={`${rating.toFixed(1)} din 5 stele`} role="img">
      {[0, 1, 2, 3, 4].map((index) => {
        const fill = Math.max(0, Math.min(1, rating - index)) * 100
        return (
          <span key={index} className={`relative ${sizeClass}`}>
            <svg className={`absolute inset-0 ${sizeClass} text-gray-300`} viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
            </svg>
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill}%` }}>
              <svg className={`${sizeClass} text-amber-400`} viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
              </svg>
            </span>
          </span>
        )
      })}
    </span>
  )
}
