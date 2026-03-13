import Link from 'next/link'
import { Place } from '@/lib/types'

const CATEGORY_EMOJI: Record<string, string> = {
  café: '☕',
  restaurant: '🍽️',
  bakery: '🥐',
  bar: '🍺',
}

interface Props {
  place: Place & { review_count: number; avg_dog_rating: number | null }
}

export default function PlaceCard({ place }: Props) {
  return (
    <Link
      href={`/places/${place.id}`}
      className="block bg-white border border-stone-200 rounded-xl p-4 hover:border-stone-400 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{CATEGORY_EMOJI[place.category]}</span>
            <h2 className="font-semibold text-stone-900">{place.name}</h2>
          </div>
          <p className="text-sm text-stone-500 mt-0.5">{place.address}</p>
        </div>
        <span className="text-xs text-stone-400 capitalize shrink-0 bg-stone-100 px-2 py-1 rounded-full">
          {place.category}
        </span>
      </div>

      <div className="flex items-center gap-4 mt-3 text-sm text-stone-500">
        {place.avg_dog_rating !== null ? (
          <span>🐶 {place.avg_dog_rating.toFixed(1)} / 5</span>
        ) : (
          <span className="text-stone-300">No reviews yet</span>
        )}
        {place.review_count > 0 && (
          <span>{place.review_count} {place.review_count === 1 ? 'review' : 'reviews'}</span>
        )}
      </div>
    </Link>
  )
}
