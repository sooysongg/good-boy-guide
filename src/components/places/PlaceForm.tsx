'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
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

// Rough mapping from Google place types → our categories
function guessCategory(types: string[]): PlaceCategory | '' {
  if (types.includes('bakery'))      return 'bakery'
  if (types.includes('bar') || types.includes('night_club')) return 'bar'
  if (types.includes('cafe'))        return 'café'
  if (types.includes('restaurant'))  return 'restaurant'
  return ''
}

export default function PlaceForm() {
  const autocompleteInputRef = useRef<HTMLInputElement>(null)
  const [error, setError]       = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Fields filled by Google Places
  const [name,     setName]     = useState('')
  const [address,  setAddress]  = useState('')
  const [coords,   setCoords]   = useState<{ lat: number; lng: number } | null>(null)
  const [category, setCategory] = useState<PlaceCategory | ''>('')
  const [placeFound, setPlaceFound] = useState(false)

  // Load Google Maps JS + init Autocomplete
  useEffect(() => {
    const input = autocompleteInputRef.current
    if (!input) return

    setOptions({
      key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      v:   'weekly',
    })

    importLibrary('places').then((lib) => {
      const { Autocomplete } = lib as google.maps.PlacesLibrary

      const autocomplete = new Autocomplete(input, {
        types:                ['establishment'],
        componentRestrictions: { country: 'no' },
        fields:               ['name', 'formatted_address', 'geometry', 'types'],
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (!place.geometry?.location) return

        setName(place.name ?? '')
        setAddress(place.formatted_address ?? '')
        setCoords({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        })
        setCategory(guessCategory(place.types ?? []))
        setPlaceFound(true)
      })
    })
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!coords) {
      setError('Please search for and select a place from the dropdown first.')
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.set('name',    name)
    formData.set('address', address)
    formData.set('lat',     String(coords.lat))
    formData.set('lng',     String(coords.lng))

    startTransition(async () => {
      const result = await createPlace(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Google Places search */}
      <div className="space-y-1.5">
        <label htmlFor="place-search" className="block text-sm font-medium text-stone-700">
          Search for a place <span className="text-red-500">*</span>
        </label>
        <input
          id="place-search"
          ref={autocompleteInputRef}
          type="text"
          placeholder="e.g. Tim Wendelboe"
          className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
        <p className="text-xs text-stone-400">Start typing and select from the dropdown — address and location fill in automatically.</p>
      </div>

      {/* Confirmed place details */}
      {placeFound && (
        <div className="bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 space-y-0.5 text-sm">
          <p className="font-medium text-stone-800">{name}</p>
          <p className="text-stone-500 text-xs">{address}</p>
          <p className="text-green-600 text-xs mt-1">
            ✓ Location confirmed — {coords?.lat.toFixed(5)}, {coords?.lng.toFixed(5)}
          </p>
        </div>
      )}

      {/* Category */}
      <div className="space-y-1.5">
        <label htmlFor="category" className="block text-sm font-medium text-stone-700">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          name="category"
          required
          value={category}
          onChange={(e) => setCategory(e.target.value as PlaceCategory)}
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
          {AMENITIES.map(({ name: amenityName, label }) => (
            <label key={amenityName} className="flex items-center gap-2.5 text-sm text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                name={amenityName}
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
        disabled={isPending || !placeFound}
        className="w-full bg-stone-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? 'Adding place…' : 'Add place'}
      </button>
    </form>
  )
}
