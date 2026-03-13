'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { PlaceCategory } from '@/lib/types'

const CATEGORIES: { value: PlaceCategory | 'all'; label: string }[] = [
  { value: 'all',        label: 'All' },
  { value: 'café',       label: 'Cafés' },
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'bakery',     label: 'Bakeries' },
  { value: 'bar',        label: 'Bars' },
]

export default function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('category') ?? 'all'

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('category')
    } else {
      params.set('category', value)
    }
    router.push(`/places?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {CATEGORIES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => select(value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            active === value
              ? 'bg-stone-900 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
