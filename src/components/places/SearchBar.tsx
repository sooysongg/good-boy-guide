'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState } from 'react'

export default function SearchBar() {
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('search') ?? '')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set('search', value.trim())
    } else {
      params.delete('search')
    }
    params.delete('page') // reset to page 1
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleClear() {
    setValue('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('search')
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-sm">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search places…"
        className="w-full border border-stone-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
      />
      {/* Search icon */}
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none text-sm">
        🔍
      </span>
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-sm"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </form>
  )
}
