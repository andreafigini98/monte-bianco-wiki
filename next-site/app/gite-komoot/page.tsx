import Link from 'next/link'
import { getAllKomootHikes } from '@/lib/komoot-hikes'
import HomeClient from '@/components/HomeClient'
import MapWrapper from '@/components/MapWrapper'

export default function GiteKomoot() {
  const hikes = getAllKomootHikes()
  const mapHikes = hikes.map(h => ({
    slug: h.slug,
    href: h.href,
    title: h.title,
    coordinate: h.coordinate,
    difficultyLevel: h.difficultyLevel,
    route: h.route,
  }))

  return (
    <>
      <HomeClient hikes={hikes} />

      {/* Mappa */}
      <div className="border-t border-stone-100">
        <div className="h-[60vh]">
          <MapWrapper hikes={mapHikes} zoom={9} center={[45.73, 7.35]} />
        </div>
      </div>

      {/* CTA altre gite */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 border-t border-stone-100 py-20">
        <Link href="/" className="group inline-flex items-center gap-4">
          <span className="font-serif text-4xl md:text-5xl font-bold text-stone-300 group-hover:text-stone-900 transition-colors duration-500">
            Scopri le altre gite →
          </span>
        </Link>
        <p className="text-sm text-stone-400 mt-3 ml-0.5">
          Gite con descrizioni dettagliate, difficoltà e tracciati locali
        </p>
      </div>
    </>
  )
}
