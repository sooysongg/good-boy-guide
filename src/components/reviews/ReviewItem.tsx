'use client'

import { useState, useTransition } from 'react'
import { updateReview, deleteReview, deleteReviewAsAdmin } from '@/app/actions/reviews'
import StarPicker from './StarPicker'

interface Review {
  id: string
  place_id: string
  user_id: string
  human_rating: number
  human_text: string
  dog_rating: number
  dog_text: string
  dog_name: string | null
  dog_breed: string | null
  created_at: string
  users: { username: string } | null
}

interface Props {
  review: Review
  currentUserId: string | null
  isAdmin: boolean
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400">
      {'★'.repeat(rating)}
      <span className="text-stone-200">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

export default function ReviewItem({ review, currentUserId, isAdmin }: Props) {
  const [editing, setEditing]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isOwner = currentUserId === review.user_id

  const date = new Date(review.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const dogIdentity = review.dog_name
    ? [review.dog_name, review.dog_breed].filter(Boolean).join(' · ')
    : null

  function handleDelete() {
    if (!confirm('Delete this review? This cannot be undone.')) return
    startTransition(async () => {
      const result = await deleteReview(review.id, review.place_id)
      if (result?.error) setError(result.error)
    })
  }

  function handleAdminDelete() {
    if (!confirm(`Delete review by ${review.users?.username ?? 'this user'}? This cannot be undone.`)) return
    startTransition(async () => {
      const result = await deleteReviewAsAdmin(review.id, review.place_id)
      if (result?.error) setError(result.error)
    })
  }

  function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('id', review.id)
    formData.set('place_id', review.place_id)
    startTransition(async () => {
      const result = await updateReview(formData)
      if (result?.error) setError(result.error)
      else setEditing(false)
    })
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-stone-700">
          {review.users?.username ?? 'Anonymous'}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-stone-400">{date}</span>
          {isOwner && !editing && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-stone-400 hover:text-stone-700 underline underline-offset-2 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-xs text-red-400 hover:text-red-600 underline underline-offset-2 transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          )}
          {isAdmin && !isOwner && !editing && (
            <button
              onClick={handleAdminDelete}
              disabled={isPending}
              title="Admin: delete review"
              className="text-xs text-red-300 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              🗑
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {editing ? (
        /* ── Edit form ── */
        <form onSubmit={handleUpdate} className="space-y-4 pt-1">
          <div className="space-y-4">
            <StarPicker name="human_rating" label="Your experience ★" defaultValue={review.human_rating} />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">What was it like for you?</label>
              <textarea
                name="human_text"
                required
                rows={2}
                defaultValue={review.human_text}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
              />
            </div>
          </div>

          <div className="space-y-4 pt-3 border-t border-stone-100">
            <p className="text-sm font-semibold text-stone-700">🐾 Your dog&apos;s experience</p>
            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide">Dog&apos;s name</label>
                <input
                  name="dog_name"
                  type="text"
                  defaultValue={review.dog_name ?? ''}
                  placeholder="Sydney"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide">Breed</label>
                <input
                  name="dog_breed"
                  type="text"
                  defaultValue={review.dog_breed ?? ''}
                  placeholder="Cobberdog"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>
            </div>
            <StarPicker name="dog_rating" label="Dog rating ★" defaultValue={review.dog_rating} />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">What did your dog think?</label>
              <textarea
                name="dog_text"
                required
                rows={2}
                defaultValue={review.dog_text}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-stone-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setError(null) }}
              className="px-4 py-2 border border-stone-300 rounded-lg text-sm text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        /* ── Display ── */
        <div className="space-y-3 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-stone-500 text-xs uppercase tracking-wide">Human</span>
              <Stars rating={review.human_rating} />
            </div>
            <p className="text-stone-700">{review.human_text}</p>
          </div>
          <div className="pt-2 border-t border-stone-100">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-stone-500 text-xs uppercase tracking-wide">Dog</span>
              <Stars rating={review.dog_rating} />
              {dogIdentity && (
                <span className="text-stone-400 text-xs">— 🐾 {dogIdentity}</span>
              )}
            </div>
            <p className="text-stone-700 italic">&ldquo;{review.dog_text}&rdquo;</p>
          </div>
        </div>
      )}
    </div>
  )
}
