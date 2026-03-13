'use client'

import { useState, useTransition } from 'react'
import { createReview } from '@/app/actions/reviews'

interface Props {
  placeId: string
}

function StarPicker({ name, label }: { name: string; label: string }) {
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-stone-700">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setSelected(n)}
            className="text-2xl leading-none"
          >
            <span className={(hovered || selected) >= n ? 'text-amber-400' : 'text-stone-200'}>
              ★
            </span>
          </button>
        ))}
      </div>
      <input type="hidden" name={name} value={selected} />
    </div>
  )
}

export default function ReviewForm({ placeId }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('place_id', placeId)
    startTransition(async () => {
      const result = await createReview(formData)
      if (result?.error) setError(result.error)
      else setSuccess(true)
    })
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
        Thanks for your review! 🐾
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Human review */}
      <div className="space-y-4">
        <StarPicker name="human_rating" label="Your experience ★" />
        <div className="space-y-1.5">
          <label htmlFor="human_text" className="block text-sm font-medium text-stone-700">
            What was it like for you?
          </label>
          <textarea
            id="human_text"
            name="human_text"
            required
            rows={2}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
          />
        </div>
      </div>

      {/* Dog review */}
      <div className="space-y-4 pt-4 border-t border-stone-100">
        <p className="text-sm font-semibold text-stone-700">🐾 Your dog&apos;s experience</p>

        {/* Dog identity (optional) */}
        <div className="flex gap-3">
          <div className="flex-1 space-y-1.5">
            <label htmlFor="dog_name" className="block text-xs font-medium text-stone-500 uppercase tracking-wide">
              Dog&apos;s name
            </label>
            <input
              id="dog_name"
              name="dog_name"
              type="text"
              placeholder="Sydney"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <label htmlFor="dog_breed" className="block text-xs font-medium text-stone-500 uppercase tracking-wide">
              Breed
            </label>
            <input
              id="dog_breed"
              name="dog_breed"
              type="text"
              placeholder="Cobberdog"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
        </div>

        <StarPicker name="dog_rating" label="Dog rating ★" />
        <div className="space-y-1.5">
          <label htmlFor="dog_text" className="block text-sm font-medium text-stone-700">
            What did your dog think?
          </label>
          <textarea
            id="dog_text"
            name="dog_text"
            required
            rows={2}
            placeholder="got snacks"
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-stone-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  )
}
