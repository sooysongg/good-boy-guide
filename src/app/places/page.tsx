import { createClient } from '@/lib/supabase/server'
import { PlaceCategory } from '@/lib/types'
import PlaceCard from '@/components/places/PlaceCard'
import CategoryFilter from '@/components/places/CategoryFilter'
import ViewToggle from '@/components/places/ViewToggle'
import SearchBar from '@/components/places/SearchBar'
import Pagination from '@/components/places/Pagination'
import Link from 'next/link'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const PlaceMap = dynamic(() => import('@/components/map/PlaceMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[580px] w-full rounded-xl bg-stone-100 animate-pulse border border-stone-200" />
  ),
})

const PAGE_SIZE = 12

interface Props {
  searchParams: Promise<{ category?: string; view?: string; search?: string; page?: string }>
}

export default async function PlacesPage({ searchParams }: Props) {
  const { category, view, search, page: pageParam } = await searchParams
  const supabase = await createClient()
  const currentPage = Math.max(1, parseInt(pageParam ?? '1'))
  const isMap = view === 'map'

  let query = supabase
    .from('places')
    .select('*, reviews(dog_rating)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (category && ['café', 'restaurant', 'bakery', 'bar'].includes(category)) {
    query = query.eq('category', category as PlaceCategory)
  }

  if (search?.trim()) {
    query = query.ilike('name', `%${search.trim()}%`)
  }

  // Map view loads all places (no pagination needed for pins)
  if (!isMap) {
    const from = (currentPage - 1) * PAGE_SIZE
    query = query.range(from, from + PAGE_SIZE - 1)
  }

  const { data: places, count, error } = await query

  if (error) {
    return <p className="text-red-500">Failed to load places: {error.message}</p>
  }

  const totalPages = isMap ? 1 : Math.ceil((count ?? 0) / PAGE_SIZE)

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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dog-friendly places in Oslo</h1>
        <Link
          href="/places/new"
          className="text-sm bg-stone-900 text-white px-4 py-2 rounded-lg hover:bg-stone-700"
        >
          + Add place
        </Link>
      </div>

      {/* Search */}
      <Suspense>
        <SearchBar />
      </Suspense>

      {/* Filters + view toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <Suspense>
          <CategoryFilter />
        </Suspense>
        <Suspense>
          <ViewToggle />
        </Suspense>
      </div>

      {/* Results count */}
      {search && (
        <p className="text-sm text-stone-500">
          {count ?? 0} result{count !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
        </p>
      )}

      {placesWithStats.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-4xl mb-3">🐾</p>
          <p className="font-medium">No places found</p>
          <p className="text-sm mt-1">
            {search ? 'Try a different search term.' : 'Be the first to add one!'}
          </p>
        </div>
      ) : isMap ? (
        <PlaceMap places={placesWithStats} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {placesWithStats.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
          <Suspense>
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </Suspense>
        </>
      )}
    </div>
  )
}
