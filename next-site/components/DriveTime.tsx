'use client'
import { useState, useEffect } from 'react'

const CAMP = { lat: 45.7168, lng: 7.2619 }

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function DriveTime({ coordinate }: { coordinate: string }) {
  const [duration, setDuration] = useState<string | null>(null)
  const [lat, lng] = coordinate.split(',').map(Number)

  useEffect(() => {
    if (isNaN(lat) || isNaN(lng)) return
    fetch(`https://router.project-osrm.org/route/v1/driving/${CAMP.lng},${CAMP.lat};${lng},${lat}?overview=false`)
      .then(r => r.json())
      .then(data => {
        if (data.code === 'Ok' && data.routes?.[0])
          setDuration(formatDuration(data.routes[0].duration))
      })
      .catch(() => {})
  }, [lat, lng])

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`

  return (
    <div className="flex items-center gap-6 pt-4 mt-4 border-t border-stone-100">
      <div className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-widest text-stone-400">In auto dal campeggio</p>
        <p className="text-sm font-semibold text-stone-900 leading-snug">
          {duration ?? <span className="text-stone-300">—</span>}
        </p>
      </div>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto shrink-0 text-[11px] font-semibold uppercase tracking-widest px-4 py-2.5 rounded-lg bg-stone-900 text-white hover:bg-stone-700 transition-colors"
      >
        Naviga →
      </a>
    </div>
  )
}
