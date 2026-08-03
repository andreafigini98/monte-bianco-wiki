import Image from 'next/image'
import Link from 'next/link'
import type { Hike, DifficultyLevel } from '@/lib/hikes'

const BADGE: Record<DifficultyLevel, string> = {
  'facile': 'bg-emerald-100 text-emerald-800',
  'media': 'bg-yellow-100 text-yellow-800',
  'impegnativa': 'bg-orange-100 text-orange-800',
  'molto impegnativa': 'bg-red-100 text-red-800',
}

export default function HikeCard({ hike }: { hike: Hike }) {
  return (
    <Link
      href={`/gite/${hike.slug}`}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col"
    >
      {hike.imageUrl && (
        <div className="relative h-48 w-full bg-slate-200">
          <Image
            src={hike.imageUrl}
            alt={hike.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-semibold text-slate-900 leading-tight">{hike.title}</h2>
          <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${BADGE[hike.difficultyLevel]}`}>
            {hike.difficultyLevel}
          </span>
        </div>
        <p className="text-sm text-slate-500 line-clamp-2">{hike.descrizione}</p>
        <div className="mt-auto pt-2 border-t border-slate-100 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
          <span>↑ {hike.dislivello}</span>
          <span>⟷ {hike.lunghezza}</span>
          <span>⏱ {hike.tempo}</span>
          <span>🚗 {hike.da_base}</span>
        </div>
      </div>
    </Link>
  )
}
