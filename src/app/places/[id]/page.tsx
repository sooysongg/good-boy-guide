import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReviewItem from '@/components/reviews/ReviewItem'
import ReviewForm from '@/components/reviews/ReviewForm'
import ReportButton from '@/components/places/ReportButton'
import AdminDeletePlaceButton from '@/components/places/AdminDeletePlaceButton'
import { NoiseLevel, PlaceCategory } from '@/lib/types'
import { ADMIN_USER_ID } from '@/lib/admin'

const CATEGORY_EMOJI: Record<PlaceCategory, string> = {
  café: '☕', restaurant: '🍽️', bakery: '🥐', bar: '🍺',
}

const NOISE_LABEL: Record<NoiseLevel, string> = {
  quiet: 'Quiet', moderate: 'Moderate', lively: 'Lively', loud: 'Loud',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function PlaceDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: place }, { data: { user } }] = await Promise.all([
    supabase
      .from('places')
      .select(`*, place_amenities(*), reviews(*, users(username))`)
      .eq('id', id)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!place) notFound()

  const reviews = place.reviews ?? []
  const avgHuman = reviews.length
    ? reviews.reduce((s: number, r: { human_rating: number }) => s + r.human_rating, 0) / reviews.length
    : null
  const avgDog = reviews.length
    ? reviews.reduce((s: number, r: { dog_rating: number }) => s + r.dog_rating, 0) / reviews.length
    : null

  const alreadyReviewed = user
    ? reviews.some((r: { user_id: string }) => r.user_id === user.id)
    : false

  const isAdmin = user?.id === ADMIN_USER_ID

  const amenities = place.place_amenities

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link href="/places" className="text-sm text-stone-500 hover:text-stone-700">
          ← Back to places
        </Link>
        <div className="flex items-start justify-between mt-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{CATEGORY_EMOJI[place.category as PlaceCategory]}</span>
              <h1 className="text-2xl font-bold">{place.name}</h1>
            </div>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <p className="text-stone-500">{place.address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query=${place.lat},${place.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-stone-400 hover:text-stone-600 transition-colors flex items-center gap-1 shrink-0"
              >
                📍 Google Maps
              </a>
            </div>
          </div>
          <span className="text-xs capitalize bg-stone-100 text-stone-500 px-2.5 py-1 rounded-full shrink-0">
            {place.category}
          </span>
        </div>
      </div>

      {/* Ratings summary */}
      {reviews.length > 0 && (
        <div className="flex gap-6 bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{avgHuman!.toFixed(1)}</p>
            <p className="text-xs text-stone-500 mt-0.5">Human rating</p>
          </div>
          <div className="w-px bg-stone-100" />
          <div className="text-center">
            <p className="text-2xl font-bold">{avgDog!.toFixed(1)}</p>
            <p className="text-xs text-stone-500 mt-0.5">Dog rating</p>
          </div>
          <div className="w-px bg-stone-100" />
          <div className="text-center">
            <p className="text-2xl font-bold">{reviews.length}</p>
            <p className="text-xs text-stone-500 mt-0.5">{reviews.length === 1 ? 'Review' : 'Reviews'}</p>
          </div>
        </div>
      )}

      {/* Amenities */}
      {amenities && (
        <div>
          <h2 className="font-semibold mb-3">Dog amenities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            <Amenity label="Dogs allowed indoors" value={amenities.dogs_allowed_indoors} />
            <Amenity label="Water bowl"            value={amenities.water_bowl} />
            <Amenity label="Treats"                value={amenities.treats} />
            <Amenity label="Outdoor seating"       value={amenities.outdoor_seating} />
            <Amenity label="Space to lie down"     value={amenities.space_to_lie_down} />
            <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-3 py-2">
              <span className="text-stone-400">🔊</span>
              <span className="text-stone-700">{NOISE_LABEL[amenities.noise_level as NoiseLevel]}</span>
            </div>
          </div>
        </div>
      )}

      {/* Reviews */}
      <div>
        <h2 className="font-semibold mb-3">
          Reviews {reviews.length > 0 && <span className="text-stone-400 font-normal">({reviews.length})</span>}
        </h2>
        {reviews.length === 0 ? (
          <p className="text-stone-400 text-sm">No reviews yet — be the first!</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review: Parameters<typeof ReviewItem>[0]['review']) => (
              <ReviewItem key={review.id} review={review} currentUserId={user?.id ?? null} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </div>

      {/* Review form */}
      <div>
        <h2 className="font-semibold mb-3">Leave a review</h2>
        {!user ? (
          <p className="text-sm text-stone-500">
            <Link href="/auth/sign-in" className="text-stone-900 underline underline-offset-2">
              Sign in
            </Link>{' '}
            to leave a review.
          </p>
        ) : alreadyReviewed ? (
          <p className="text-sm text-stone-500">You&apos;ve already reviewed this place.</p>
        ) : (
          <ReviewForm placeId={place.id} />
        )}
      </div>
      {/* Report + Admin delete */}
      <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
        <ReportButton placeId={place.id} />
        {isAdmin && (
          <AdminDeletePlaceButton placeId={place.id} placeName={place.name} />
        )}
      </div>
    </div>
  )
}

function Amenity({ label, value }: { label: string; value: boolean }) {
  return (
    <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm ${
      value ? 'bg-white border-stone-200 text-stone-700' : 'bg-stone-50 border-stone-100 text-stone-300'
    }`}>
      <span>{value ? '✓' : '✗'}</span>
      <span>{label}</span>
    </div>
  )
}
