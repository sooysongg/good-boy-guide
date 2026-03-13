'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export default function ViewToggle() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const view = searchParams.get('view') ?? 'list'

  function switchTo(v: 'list' | 'map') {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', v)
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex rounded-lg border border-stone-200 overflow-hidden text-sm w-fit">
      <button
        onClick={() => switchTo('list')}
        className={`px-3 py-1.5 transition-colors ${
          view === 'list'
            ? 'bg-stone-900 text-white'
            : 'text-stone-500 hover:bg-stone-50'
        }`}
      >
        ☰ List
      </button>
      <button
        onClick={() => switchTo('map')}
        className={`px-3 py-1.5 transition-colors ${
          view === 'map'
            ? 'bg-stone-900 text-white'
            : 'text-stone-500 hover:bg-stone-50'
        }`}
      >
        🗺 Map
      </button>
    </div>
  )
}
