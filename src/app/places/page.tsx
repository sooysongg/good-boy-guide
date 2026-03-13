import { createClient } from '@/lib/supabase/server'
import { ADMIN_USER_ID } from '@/lib/admin'

import PlaceCard from '@/components/places/PlaceCard'
import CategoryFilter from '@/components/places/CategoryFilter'
import ViewToggle from '@/components/places/ViewToggle'
import SearchBar from '@/components/places/SearchBar'
import SortSelect from '@/components/places/SortSelect'
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

type SortOption = 'newest' | 'az' | 'rating' | 'popular'

interface Props {
  searchParams: Promise<{
    category?: string | string[]
    view?: string
    search?: string
    page?: string
    sort?: string
  }>
}

export default async function PlacesPage({ searchParams }: Props) {
  const { category, view, search, page: pageParam, sort } = await searchParams
  const supabase    = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = user?.id === ADMIN_USER_ID
  const currentPage = Math.max(1, parseInt(pageParam ?? '1'))
  const isMap       = view === 'map'
  const sortBy      = (sort ?? 'newest') as SortOption

  // Base query — always fetch reviews so we can compute stats
  let query = supabase
    .from('places')
    .select('*, reviews(dog_rating)', { count: 'exact' })

  // Normalise category param — Next can give string or string[]
  const VALID_CATS = ['café', 'restaurant', 'bakery', 'bar']
  const selectedCats = (Array.isArray(category) ? category : category ? [category] : [])
    .filter(c => VALID_CATS.includes(c))

  if (selectedCats.length === 1) {
    query = query.contains('categories', [selectedCats[0]])
  } else if (selectedCats.length > 1) {
    // OR: places that contain ANY of the selected categories
    query = query.or(selectedCats.map(c => `categories.cs.{${c}}`).join(','))
  }

  // Search filter
  if (search?.trim()) {
    query = query.ilike('name', `%${search.trim()}%`)
  }

  // Sorting — rating/popular need client-side sort after stats are computed
  if (sortBy === 'az') {
    query = query.order('name', { ascending: true })
  } else {
    // newest is default; rating + popular sorted client-side after stats
    query = query.order('created_at', { ascending: false })
  }

  // Pagination (skip for map — it needs all pins)
  if (!isMap) {
    const from = (currentPage - 1) * PAGE_SIZE
    query = query.range(from, from + PAGE_SIZE - 1)
  }

  const { data: places, count, error } = await query

  if (error) {
    return <p className="text-red-500">Failed to load places: {error.message}</p>
  }

  // Compute per-place stats
  let placesWithStats = (places ?? []).map((place) => {
    const reviews: { dog_rating: number }[] = place.reviews ?? []
    const review_count  = reviews.length
    const avg_dog_rating =
      review_count > 0
        ? reviews.reduce((sum, r) => sum + r.dog_rating, 0) / review_count
        : null
    return { ...place, review_count, avg_dog_rating }
  })

  // Client-side sorts (DB can't easily sort by computed avg)
  if (sortBy === 'rating') {
    placesWithStats = [...placesWithStats].sort((a, b) => {
      if (a.avg_dog_rating === null && b.avg_dog_rating === null) return 0
      if (a.avg_dog_rating === null) return 1
      if (b.avg_dog_rating === null) return -1
      return b.avg_dog_rating - a.avg_dog_rating
    })
  } else if (sortBy === 'popular') {
    placesWithStats = [...placesWithStats].sort((a, b) => b.review_count - a.review_count)
  }

  const totalPages = isMap ? 1 : Math.ceil((count ?? 0) / PAGE_SIZE)

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

      {/* Filters + sort + view toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <Suspense>
          <CategoryFilter />
        </Suspense>
        <div className="flex items-center gap-3 ml-auto">
          <Suspense>
            <SortSelect />
          </Suspense>
          <Suspense>
            <ViewToggle />
          </Suspense>
        </div>
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
              <PlaceCard key={place.id} place={place} isAdmin={isAdmin} />
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
