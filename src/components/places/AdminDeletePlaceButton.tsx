'use client'

import { useTransition } from 'react'
import { deletePlaceAsAdmin } from '@/app/actions/places'

interface Props {
  placeId: string
  placeName: string
}

export default function AdminDeletePlaceButton({ placeId, placeName }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`Delete "${placeName}"? This will also remove all its reviews. This cannot be undone.`)) return
    startTransition(async () => {
      await deletePlaceAsAdmin(placeId)
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-sm text-red-400 hover:text-red-600 transition-colors disabled:opacity-50 flex items-center gap-1.5"
    >
      🗑 {isPending ? 'Deleting…' : 'Delete this place'}
    </button>
  )
}
