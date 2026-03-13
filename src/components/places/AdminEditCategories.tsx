'use client'

import { useState, useTransition } from 'react'
import { PlaceCategory } from '@/lib/types'
import { updatePlaceCategoriesAsAdmin } from '@/app/actions/places'

const ALL_CATEGORIES: PlaceCategory[] = ['café', 'restaurant', 'bakery', 'bar']

const LABEL: Record<PlaceCategory, string> = {
  café: 'Café',
  restaurant: 'Restaurant',
  bakery: 'Bakery',
  bar: 'Bar',
}

interface Props {
  placeId: string
  currentCategories: PlaceCategory[]
}

export default function AdminEditCategories({ placeId, currentCategories }: Props) {
  const [editing, setEditing] = useState(false)
  const [categories, setCategories] = useState<PlaceCategory[]>(currentCategories)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function toggle(cat: PlaceCategory) {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  function handleSave() {
    if (categories.length === 0) return
    startTransition(async () => {
      const result = await updatePlaceCategoriesAsAdmin(placeId, categories)
      if (result?.error) {
        setError(result.error)
      } else {
        setEditing(false)
        setError(null)
      }
    })
  }

  function handleCancel() {
    setEditing(false)
    setCategories(currentCategories)
    setError(null)
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-stone-400 hover:text-stone-600 underline underline-offset-2"
      >
        Edit categories
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2 mt-1">
      <div className="flex gap-2 flex-wrap">
        {ALL_CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => toggle(cat)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
              categories.includes(cat)
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
            }`}
          >
            {LABEL[cat]}
          </button>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isPending || categories.length === 0}
          className="text-xs bg-stone-900 text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={handleCancel}
          className="text-xs text-stone-500 hover:text-stone-700 px-3 py-1.5 rounded-lg border border-stone-200"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
