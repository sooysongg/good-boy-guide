'use client'

import { useRef, useState, useTransition } from 'react'
import { createPlace } from '@/app/actions/places'
import { PlaceCategory, NoiseLevel } from '@/lib/types'

const CATEGORIES: { value: PlaceCategory; label: string }[] = [
  { value: 'café',       label: 'Café' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'bakery',     label: 'Bakery' },
  { value: 'bar',        label: 'Bar' },
]

const NOISE_LEVELS: { value: NoiseLevel; label: string }[] = [
  { value: 'quiet',    label: 'Quiet' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'lively',   label: 'Lively' },
  { value: 'loud',     label: 'Loud' },
]

const AMENITIES = [
  { name: 'dogs_allowed_indoors', label: 'Dogs allowed indoors' },
  { name: 'water_bowl',           label: 'Water bowl provided' },
  { name: 'treats',               label: 'Treats available' },
  { name: 'outdoor_seating',      label: 'Outdoor seating' },
  { name: 'space_to_lie_down',    label: 'Space to lie down' },
]

export default function PlaceForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [geocodeStatus, setGeocodeStatus] = useState<'idle' | 'loading' | 'found' | 'not_found'>('idle')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [isPending, startTransition] = useTransition()

  async function geocodeAddress(address: string) {
    if (!address.trim()) return
    setGeocodeStatus('loading')
    setCoords(null)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ', Oslo, Norway')}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      if (data.length > 0) {
        setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) })
        setGeocodeStatus('found')
      } else {
        setGeocodeStatus('not_found')
      }
    } catch {
      setGeocodeStatus('not_found')
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!coords) {
      setError('Please verify the address first — click outside the address field.')
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.set('lat', String(coords.lat))
    formData.set('lng', String(coords.lng))

    startTransition(async () => {
      const result = await createPlace(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="block text-sm font-medium text-stone-700">
          Place name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g. Tim Wendelboe"
          className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <label htmlFor="address" className="block text-sm font-medium text-stone-700">
          Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="address"
            name="address"
            type="text"
            required
            placeholder="e.g. Grüners gate 1"
            onBlur={(e) => geocodeAddress(e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
        </div>
        {geocodeStatus === 'loading' && (
          <p className="text-xs text-stone-400">Looking up address…</p>
        )}
        {geocodeStatus === 'found' && coords && (
          <p className="text-xs text-green-600">
            ✓ Found — {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </p>
        )}
        {geocodeStatus === 'not_found' && (
          <p className="text-xs text-red-500">
            Address not found. Try adding the street number or neighbourhood.
          </p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <label htmlFor="category" className="block text-sm font-medium text-stone-700">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue=""
          className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
        >
          <option value="" disabled>Select a category</option>
          {CATEGORIES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Dog amenities */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-stone-700">Dog amenities</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {AMENITIES.map(({ name, label }) => (
            <label key={name} className="flex items-center gap-2.5 text-sm text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                name={name}
                className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-400"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Noise level */}
      <div className="space-y-1.5">
        <label htmlFor="noise_level" className="block text-sm font-medium text-stone-700">
          Noise level
        </label>
        <select
          id="noise_level"
          name="noise_level"
          defaultValue="moderate"
          className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white"
        >
          {NOISE_LEVELS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending || geocodeStatus === 'loading'}
        className="w-full bg-stone-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? 'Adding place…' : 'Add place'}
      </button>
    </form>
  )
}
