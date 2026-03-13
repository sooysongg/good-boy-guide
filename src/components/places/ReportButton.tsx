'use client'

import { useState, useTransition } from 'react'
import { createReport } from '@/app/actions/reports'

const REASONS = [
  'No longer dog friendly',
  'Dogs not allowed indoors anymore',
  'Permanently closed',
  'Wrong information',
  'Other',
]

export default function ReportButton({ placeId }: { placeId: string }) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('place_id', placeId)
    startTransition(async () => {
      const result = await createReport(formData)
      if (result?.success) setDone(true)
    })
  }

  if (done) {
    return (
      <p className="text-xs text-stone-400 text-center">
        Thanks for the heads up — we&apos;ll look into it.
      </p>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
      >
        ⚑ Report an issue with this place
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-sm">
      <p className="font-medium text-stone-700">What&apos;s the issue?</p>
      <div className="space-y-1.5">
        {REASONS.map((r) => (
          <label key={r} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="reason"
              value={r}
              required
              className="accent-stone-800"
            />
            <span className="text-stone-600">{r}</span>
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-stone-900 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-stone-700 disabled:opacity-50"
        >
          {isPending ? 'Sending…' : 'Send report'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-stone-400 text-xs px-3 py-1.5 hover:text-stone-600"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
