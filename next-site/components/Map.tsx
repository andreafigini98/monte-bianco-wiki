'use client'
import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length < 2) return
    map.fitBounds(L.latLngBounds(points), { padding: [32, 32] })
  }, [map, points])
  return null
}

export type MapHike = {
  slug: string
  title: string
  coordinate: string
  difficultyLevel: string
  href?: string
  route?: [number, number][]
}

const CAMP = { lat: 45.7168, lng: 7.2619 }

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

const DIFFICULTY_LABEL: Record<string, string> = {
  'facile': 'Facile',
  'media': 'Media',
  'impegnativa': 'Impegnativa',
  'molto impegnativa': 'Molto impegnativa',
}

function coloredIcon(difficulty: string, size = 14) {
  const color = DIFFICULTY_COLOR[difficulty] ?? '#78716c'
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 6],
  })
}

const campIcon = L.divIcon({
  className: '',
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#292524;border:2.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -14],
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
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
}

function hikePopup(h: MapHike, lat: number, lng: number, diffColor: string) {
  return (
    <div style={{ padding: '14px 16px', fontFamily: 'inherit', minWidth: 200 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: diffColor, display: 'inline-block', flexShrink: 0 }} />
        <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.09em', color: '#a8a29e' }}>
          {DIFFICULTY_LABEL[h.difficultyLevel] ?? h.difficultyLevel}
        </span>
      </div>
      <p style={{ fontSize: '14px', fontWeight: 700, color: '#1c1917', lineHeight: 1.3, marginBottom: 12 }}>
        {h.title}
      </p>
      <div style={{ height: 1, background: '#f5f5f4', marginBottom: 12 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <a
          href={mapsUrl(lat, lng)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block', textAlign: 'center',
            fontSize: '11px', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: '#1c1917', background: '#f5f5f4',
            padding: '9px 12px', borderRadius: 6, textDecoration: 'none',
            border: '1.5px solid #e7e5e4',
          }}
        >
          Naviga →
        </a>
        <a
          href={h.href ?? `/gite/${h.slug}`}
          style={{
            display: 'block', textAlign: 'center',
            fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase',
            color: '#78716c', textDecoration: 'none',
          }}
        >
          Vedi scheda →
        </a>
      </div>
    </div>
  )
}

type Props = { hikes: MapHike[]; zoom?: number; center?: [number, number]; trailRoute?: [number, number][] }

export default function Map({ hikes, zoom = 9, center = [45.73, 7.35], trailRoute }: Props) {
  const [route, setRoute] = useState<[number, number][]>([])
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null)

  const boundsPoints = useMemo<[number, number][]>(() => {
    if (trailRoute && trailRoute.length > 1) return trailRoute
    // multi-hike overview: fit all routes
    const allRoutePoints = hikes.flatMap(h => h.route ?? [])
    if (allRoutePoints.length > 1) return allRoutePoints
    if (hikes.length !== 1) return []
    const [lat, lng] = hikes[0].coordinate.split(',').map(Number)
    if (isNaN(lat) || isNaN(lng)) return []
    if (route.length > 0) return route
    return [[CAMP.lat, CAMP.lng], [lat, lng]]
  }, [hikes, route, trailRoute])

  useEffect(() => {
    if (hikes.length !== 1) return
    const [lat, lng] = hikes[0].coordinate.split(',').map(Number)
    if (isNaN(lat) || isNaN(lng)) return
    fetchOsrmRoute(lat, lng).then(setRoute)
  }, [hikes])

  async function handleMarkerClick(h: MapHike) {
    if (hikes.length === 1) return
    const [lat, lng] = h.coordinate.split(',').map(Number)
    if (isNaN(lat) || isNaN(lng)) return
    setLoadingSlug(h.slug)
    const coords = await fetchOsrmRoute(lat, lng)
    setRoute(coords)
    setLoadingSlug(null)
  }

  return (
    <MapContainer center={center} zoom={zoom} className="h-full w-full" scrollWheelZoom>
      <FitBounds points={boundsPoints} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Campground marker */}
      <Marker position={[CAMP.lat, CAMP.lng]} icon={campIcon}>
        <Popup maxWidth={200}>
          <div style={{ padding: '14px 16px 12px', fontFamily: 'inherit' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a8a29e', marginBottom: 4 }}>Base</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#1c1917', lineHeight: 1.3 }}>Camping Monte Bianco</p>
            <p style={{ fontSize: '12px', color: '#78716c', marginTop: 2 }}>Sarre (AO)</p>
          </div>
        </Popup>
      </Marker>

      {/* Per-hike GPS routes — clickable to open popup */}
      {hikes.map(h => {
        if (!h.route || h.route.length < 2) return null
        const [lat, lng] = h.coordinate.split(',').map(Number)
        const diffColor = DIFFICULTY_COLOR[h.difficultyLevel] ?? '#78716c'
        const popup = hikePopup(h, lat, lng, diffColor)
        return (
          <Polyline
            key={`route-${h.slug}`}
            positions={h.route}
            pathOptions={{ color: diffColor, weight: 4, opacity: 0.8 }}
          >
            <Popup maxWidth={240}>{popup}</Popup>
          </Polyline>
        )
      })}

      {/* Single trail route (detail page) */}
      {trailRoute && trailRoute.length > 1 && (
        <Polyline
          positions={trailRoute}
          pathOptions={{ color: '#10b981', weight: 3, opacity: 0.85 }}
        />
      )}

      {/* Driving route from campground */}
      {route.length > 0 && (
        <Polyline
          positions={route}
          pathOptions={{ color: '#292524', weight: 2.5, opacity: 0.55, dashArray: '6 5' }}
        />
      )}

      {/* Hike start markers */}
      {hikes.map(h => {
        const [lat, lng] = h.coordinate.split(',').map(Number)
        if (isNaN(lat) || isNaN(lng)) return null
        const diffColor = DIFFICULTY_COLOR[h.difficultyLevel] ?? '#78716c'
        return (
          <Marker
            key={h.slug}
            position={[lat, lng]}
            icon={coloredIcon(h.difficultyLevel)}
            eventHandlers={{ click: () => handleMarkerClick(h) }}
          >
            <Popup maxWidth={240}>{hikePopup(h, lat, lng, diffColor)}</Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
