'use client'

import { useState, useTransition } from 'react'
import { NoiseLevel } from '@/lib/types'
import { updatePlaceAmenitiesAsAdmin } from '@/app/actions/places'

interface AmenityState {
  dogs_allowed_indoors: boolean
  water_bowl: boolean
  treats: boolean
  outdoor_seating: boolean
  space_to_lie_down: boolean
  noise_level: NoiseLevel
}

const NOISE_OPTIONS: { value: NoiseLevel; label: string }[] = [
  { value: 'quiet',    label: 'Quiet' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'lively',   label: 'Lively' },
  { value: 'loud',     label: 'Loud' },
]

const BOOL_FIELDS: { key: keyof Omit<AmenityState, 'noise_level'>; label: string }[] = [
  { key: 'dogs_allowed_indoors', label: 'Dogs allowed indoors' },
  { key: 'water_bowl',           label: 'Water bowl' },
  { key: 'treats',               label: 'Treats' },
  { key: 'outdoor_seating',      label: 'Outdoor seating' },
  { key: 'space_to_lie_down',    label: 'Space to lie down' },
]

interface Props {
  placeId: string
  current: AmenityState
}

export default function AdminEditAmenities({ placeId, current }: Props) {
  const [editing, setEditing] = useState(false)
  const [state, setState] = useState<AmenityState>(current)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function toggle(key: keyof Omit<AmenityState, 'noise_level'>) {
    setState(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updatePlaceAmenitiesAsAdmin(placeId, state)
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
    setState(current)
    setError(null)
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-stone-400 hover:text-stone-600 underline underline-offset-2"
      >
        Edit amenities
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl">
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Edit amenities</p>

      {/* Boolean toggles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {BOOL_FIELDS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm transition-colors ${
              state[key]
                ? 'bg-white border-stone-900 text-stone-900 font-medium'
                : 'bg-stone-100 border-stone-200 text-stone-400'
            }`}
          >
            <span>{state[key] ? '✓' : '✗'}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Noise level */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-stone-600">🔊 Noise level:</span>
        <div className="flex gap-1">
          {NOISE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setState(prev => ({ ...prev, noise_level: value }))}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                state.noise_level === value
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isPending}
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
