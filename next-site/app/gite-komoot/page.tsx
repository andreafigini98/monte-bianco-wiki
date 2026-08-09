import Link from 'next/link'
import { getAllKomootHikes } from '@/lib/komoot-hikes'
import HomeClient from '@/components/HomeClient'

export default function GiteKomoot() {
  const hikes = getAllKomootHikes()
  return (
    <>
      <HomeClient hikes={hikes} />
      <div className="max-w-7xl mx-auto px-6 md:px-12 border-t border-stone-100 py-20">
        <Link
          href="/"
          className="group inline-flex items-center gap-4"
        >
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
