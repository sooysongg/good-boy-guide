'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { Place } from '@/lib/types'
import { deletePlaceAsAdmin } from '@/app/actions/places'

const CATEGORY_EMOJI: Record<string, string> = {
  café: '☕',
  restaurant: '🍽️',
  bakery: '🥐',
  bar: '🍺',
}

interface Props {
  place: Place & { review_count: number; avg_dog_rating: number | null }
  isAdmin?: boolean
}

function googleMapsUrl(lat: number, lng: number, name: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query=${lat},${lng}`
}

export default function PlaceCard({ place, isAdmin }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleAdminDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Delete "${place.name}"? This will also remove all its reviews. This cannot be undone.`)) return
    startTransition(async () => {
      await deletePlaceAsAdmin(place.id)
    })
  }

  return (
    <div className={`bg-white border border-stone-200 rounded-xl p-4 hover:border-stone-400 hover:shadow-sm transition-all relative ${isPending ? 'opacity-50' : ''}`}>
      {isAdmin && (
        <button
          onClick={handleAdminDelete}
          disabled={isPending}
          title="Admin: delete place"
          className="absolute top-3 right-3 text-red-300 hover:text-red-500 transition-colors text-sm disabled:opacity-50 z-10"
        >
          🗑
        </button>
      )}

      <Link href={`/places/${place.id}`} className="block">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{CATEGORY_EMOJI[place.categories?.[0] ?? place.category]}</span>
              <h2 className="font-semibold text-stone-900">{place.name}</h2>
            </div>
            <p className="text-sm text-stone-500 mt-0.5">{place.address}</p>
          </div>
          <div className={`flex flex-wrap justify-end gap-1 shrink-0 ${isAdmin ? 'pr-6' : ''}`}>
            {(place.categories?.length ? place.categories : [place.category]).map((cat) => (
              <span key={cat} className="text-xs text-stone-400 capitalize bg-stone-100 px-2 py-1 rounded-full">
                {cat}
              </span>
            ))}
          </div>
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

      {/* Google Maps link — separate from the card link so it doesn't trigger navigation */}
      <a
        href={googleMapsUrl(place.lat, place.lng, place.name)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 mt-3 text-xs text-stone-400 hover:text-stone-600 transition-colors"
      >
        <span>📍</span> Open in Google Maps
      </a>
    </div>
  )
}
