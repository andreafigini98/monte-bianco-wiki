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
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-widest text-stone-400">In auto</p>
      <p className="text-sm font-semibold text-stone-900 leading-snug">
        {duration ?? <span className="text-stone-300">—</span>}
      </p>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-[10px] uppercase tracking-widest text-stone-600 hover:text-stone-900 transition-colors border-b border-stone-400 hover:border-stone-700 leading-tight font-semibold"
      >
        Naviga ↗
      </a>
    </div>
  )
}
