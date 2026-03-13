'use client'

import { useState } from 'react'

interface Props {
  name: string
  label: string
  defaultValue?: number
}

export default function StarPicker({ name, label, defaultValue = 0 }: Props) {
  const [hovered,  setHovered]  = useState(0)
  const [selected, setSelected] = useState(defaultValue)

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
