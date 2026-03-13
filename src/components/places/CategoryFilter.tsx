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
  const active = searchParams.getAll('category')
  const isAll = active.length === 0

  function toggle(value: PlaceCategory | 'all') {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('category')
    params.delete('page')

    if (value === 'all') {
      // nothing to set — no category params = show all
    } else {
      const current = searchParams.getAll('category')
      const next = current.includes(value)
        ? current.filter(c => c !== value)      // deselect
        : [...current, value]                    // select
      next.forEach(c => params.append('category', c))
    }

    router.push(`/places?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {CATEGORIES.map(({ value, label }) => {
        const isActive = value === 'all' ? isAll : active.includes(value)
        return (
          <button
            key={value}
            onClick={() => toggle(value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
