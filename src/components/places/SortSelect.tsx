'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const OPTIONS = [
  { value: 'newest',  label: 'Newest first' },
  { value: 'az',      label: 'A – Z' },
  { value: 'rating',  label: 'Best dog rating' },
  { value: 'popular', label: 'Most reviewed' },
]

export default function SortSelect() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const current      = searchParams.get('sort') ?? 'newest'

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', e.target.value)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
      aria-label="Sort places"
    >
      {OPTIONS.map(({ value, label }) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  )
}
