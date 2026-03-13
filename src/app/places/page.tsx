import { createClient } from '@/lib/supabase/server'
import { PlaceCategory } from '@/lib/types'
import PlaceCard from '@/components/places/PlaceCard'
import CategoryFilter from '@/components/places/CategoryFilter'
import Link from 'next/link'
import { Suspense } from 'react'

interface Props {
  searchParams: Promise<{ category?: string }>
}

export default async function PlacesPage({ searchParams }: Props) {
  const { category } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('places')
    .select(`
      *,
      reviews(dog_rating)
    `)
    .order('created_at', { ascending: false })

  if (category && ['café', 'restaurant', 'bakery', 'bar'].includes(category)) {
    query = query.eq('category', category as PlaceCategory)
  }

  const { data: places, error } = await query

  if (error) {
    return <p className="text-red-500">Failed to load places: {error.message}</p>
  }

  const placesWithStats = (places ?? []).map((place) => {
    const reviews: { dog_rating: number }[] = place.reviews ?? []
    const review_count = reviews.length
    const avg_dog_rating =
      review_count > 0
        ? reviews.reduce((sum, r) => sum + r.dog_rating, 0) / review_count
        : null
    return { ...place, review_count, avg_dog_rating }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dog-friendly places in Oslo</h1>
        <Link
          href="/places/new"
          className="text-sm bg-stone-900 text-white px-4 py-2 rounded-lg hover:bg-stone-700"
        >
          + Add place
        </Link>
      </div>

      <Suspense>
        <CategoryFilter />
      </Suspense>

      {placesWithStats.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-4xl mb-3">🐾</p>
          <p className="font-medium">No places found</p>
          <p className="text-sm mt-1">Be the first to add one!</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {placesWithStats.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </div>
  )
}
