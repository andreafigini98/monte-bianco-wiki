'use client'
import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export type MapHike = {
  slug: string
  title: string
  coordinate: string
  difficultyLevel: string
}

const CAMP = { lat: 45.7168, lng: 7.2619 }

// Fix broken default marker icons in webpack builds
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const DIFFICULTY_COLOR: Record<string, string> = {
  'facile': '#10b981',
  'media': '#eab308',
  'impegnativa': '#f97316',
  'molto impegnativa': '#ef4444',
}

function coloredIcon(difficulty: string, size = 16) {
  const color = DIFFICULTY_COLOR[difficulty] ?? '#64748b'
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.4)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  })
}

const campIcon = L.divIcon({
  className: '',
  html: `<div style="width:22px;height:22px;border-radius:50%;background:#1d4ed8;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;font-size:11px">⛺</div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -16],
})

async function fetchOsrmRoute(toLat: number, toLng: number): Promise<[number, number][]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${CAMP.lng},${CAMP.lat};${toLng},${toLat}?overview=full&geometries=geojson`
    const res = await fetch(url)
    const data = await res.json()
    if (data.code !== 'Ok' || !data.routes?.[0]) return []
    return (data.routes[0].geometry.coordinates as [number, number][]).map(([lng, lat]) => [lat, lng])
  } catch {
    return []
  }
}

function mapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&origin=${CAMP.lat},${CAMP.lng}&destination=${lat},${lng}&travelmode=driving`
}

type Props = { hikes: MapHike[]; zoom?: number; center?: [number, number] }

export default function Map({ hikes, zoom = 9, center = [45.73, 7.35] }: Props) {
  const [route, setRoute] = useState<[number, number][]>([])
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null)

  // Auto-load route for mini-map (single hike)
  useEffect(() => {
    if (hikes.length !== 1) return
    const [lat, lng] = hikes[0].coordinate.split(',').map(Number)
    if (isNaN(lat) || isNaN(lng)) return
    fetchOsrmRoute(lat, lng).then(setRoute)
  }, [hikes])

  async function handleMarkerClick(h: MapHike) {
    if (hikes.length === 1) return // already loaded
    const [lat, lng] = h.coordinate.split(',').map(Number)
    if (isNaN(lat) || isNaN(lng)) return
    setLoadingSlug(h.slug)
    const coords = await fetchOsrmRoute(lat, lng)
    setRoute(coords)
    setLoadingSlug(null)
  }

  return (
    <MapContainer center={center} zoom={zoom} className="h-full w-full" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Campground marker */}
      <Marker position={[CAMP.lat, CAMP.lng]} icon={campIcon}>
        <Popup>
          <div className="text-sm space-y-0.5">
            <p className="font-semibold">⛺ Camping Monte Bianco</p>
            <p className="text-slate-500 text-xs">Sarre (AO) — base di partenza</p>
          </div>
        </Popup>
      </Marker>

      {/* Route polyline */}
      {route.length > 0 && (
        <Polyline
          positions={route}
          pathOptions={{ color: '#1d4ed8', weight: 3, opacity: 0.7, dashArray: '8 4' }}
        />
      )}

      {/* Hike markers */}
      {hikes.map(h => {
        const [lat, lng] = h.coordinate.split(',').map(Number)
        if (isNaN(lat) || isNaN(lng)) return null
        const isLoading = loadingSlug === h.slug
        return (
          <Marker
            key={h.slug}
            position={[lat, lng]}
            icon={coloredIcon(h.difficultyLevel)}
            eventHandlers={{ click: () => handleMarkerClick(h) }}
          >
            <Popup>
              <div className="text-sm space-y-2" style={{ minWidth: 180 }}>
                <p className="font-semibold leading-tight">{h.title}</p>
                <p className="capitalize text-slate-500 text-xs">{h.difficultyLevel}</p>
                <div className="flex flex-col gap-1.5 pt-1">
                  <a
                    href={mapsUrl(lat, lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-center justify-center transition-colors"
                  >
                    🗺️ Naviga da campeggio
                  </a>
                  <a
                    href={`/gite/${h.slug}`}
                    className="text-xs text-slate-500 hover:text-slate-800 text-center transition-colors"
                  >
                    {isLoading ? 'Caricamento percorso…' : 'Vedi scheda →'}
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
