import { getAllKomootHikes } from '@/lib/komoot-hikes'
import MapWrapper from '@/components/MapWrapper'

export const metadata = {
  title: 'Mappa gite — Monte Bianco Wiki',
}

export default function MapPage() {
  const hikes = getAllKomootHikes().map(h => ({
    slug: h.slug,
    href: h.href,
    title: h.title,
    coordinate: h.coordinate,
    difficultyLevel: h.difficultyLevel,
    route: h.route,
  }))

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      <div className="flex items-center gap-4 px-4 py-2 bg-white border-b border-slate-100 text-sm text-slate-500">
        <span className="font-medium text-slate-700">{hikes.length} gite Komoot</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-emerald-500"></span>Facile</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-yellow-400"></span>Media</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-orange-500"></span>Impegnativa</span>
      </div>
      <div className="flex-1">
        <MapWrapper hikes={hikes} zoom={9} center={[45.73, 7.35]} />
      </div>
    </div>
  )
}
