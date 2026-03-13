'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import type { PlaceCategory } from '@/lib/types'

const CATEGORY_COLOR: Record<PlaceCategory, string> = {
  café:       '#a8764f',
  restaurant: '#ea580c',
  bakery:     '#d97706',
  bar:        '#7c3aed',
}

const CATEGORY_EMOJI: Record<PlaceCategory, string> = {
  café:       '☕',
  restaurant: '🍽️',
  bakery:     '🥐',
  bar:        '🍺',
}

export interface MapPlace {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  category: PlaceCategory
}

interface Props {
  places: MapPlace[]
}

export default function PlaceMap({ places }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<ReturnType<typeof import('leaflet')['map']> | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    import('leaflet').then((L) => {
      const map = L.map(containerRef.current!, {
        center: [59.9139, 10.7522],
        zoom: 13,
      })
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      places.forEach((place) => {
        const color = CATEGORY_COLOR[place.category]
        const emoji = CATEGORY_EMOJI[place.category]

        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:14px;height:14px;
            background:${color};
            border-radius:50%;
            border:2.5px solid white;
            box-shadow:0 1px 4px rgba(0,0,0,0.35);
          "></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
          popupAnchor: [0, -10],
        })

        L.marker([place.lat, place.lng], { icon })
          .bindPopup(`
            <div style="font-family:system-ui,sans-serif;min-width:170px;line-height:1.4">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
                <span style="font-size:16px">${emoji}</span>
                <strong style="font-size:14px;color:#1c1917">${place.name}</strong>
              </div>
              <p style="font-size:12px;color:#78716c;margin:0 0 8px">${place.address}</p>
              <a href="/places/${place.id}"
                style="font-size:12px;color:#1c1917;font-weight:600;text-decoration:underline">
                View details →
              </a>
            </div>
          `)
          .addTo(map)
      })
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="h-[580px] w-full rounded-xl overflow-hidden border border-stone-200"
      />
      <div className="flex gap-4 flex-wrap text-xs text-stone-500">
        {(Object.entries(CATEGORY_COLOR) as [PlaceCategory, string][]).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <span className="capitalize">{cat}</span>
          </div>
        ))}
        <span className="ml-auto">{places.length} places</span>
      </div>
    </div>
  )
}
