'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface Props {
  currentPage: number
  totalPages:  number
}

export default function Pagination({ currentPage, totalPages }: Props) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  function goTo(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  // Show a window of pages around the current one
  const pages: (number | '…')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 text-sm rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        ←
      </button>

      {pages.map((page, i) =>
        page === '…' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-stone-400 text-sm select-none">…</span>
        ) : (
          <button
            key={page}
            onClick={() => goTo(page as number)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              page === currentPage
                ? 'bg-stone-900 text-white border-stone-900'
                : 'border-stone-200 hover:bg-stone-50 text-stone-700'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 text-sm rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        →
      </button>
    </div>
  )
}
