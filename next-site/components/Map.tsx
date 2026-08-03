'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export type MapHike = {
  slug: string
  title: string
  coordinate: string
  difficultyLevel: string
}

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

function coloredIcon(difficulty: string) {
  const color = DIFFICULTY_COLOR[difficulty] ?? '#64748b'
  return L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,.4)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -12],
  })
}

type Props = { hikes: MapHike[]; zoom?: number; center?: [number, number] }

export default function Map({ hikes, zoom = 9, center = [45.73, 7.35] }: Props) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {hikes.map(h => {
        const [lat, lng] = h.coordinate.split(',').map(Number)
        if (isNaN(lat) || isNaN(lng)) return null
        return (
          <Marker key={h.slug} position={[lat, lng]} icon={coloredIcon(h.difficultyLevel)}>
            <Popup>
              <div className="text-sm space-y-1">
                <p className="font-semibold">{h.title}</p>
                <p className="capitalize text-slate-500">{h.difficultyLevel}</p>
                <a
                  href={`/gite/${h.slug}`}
                  className="text-emerald-600 hover:underline block"
                >
                  Vedi scheda →
                </a>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
