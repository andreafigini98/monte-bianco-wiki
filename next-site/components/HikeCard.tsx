import Image from 'next/image'
import Link from 'next/link'
import type { Hike, DifficultyLevel } from '@/lib/hikes'

const DIFF_COLOR: Record<DifficultyLevel, string> = {
  'facile': 'text-emerald-600',
  'media': 'text-amber-600',
  'impegnativa': 'text-orange-600',
  'molto impegnativa': 'text-red-600',
}

export default function HikeCard({ hike }: { hike: Hike }) {
  return (
    <Link href={`/gite/${hike.slug}`} className="group block">
      <div className="aspect-[4/3] relative overflow-hidden bg-stone-100 mb-4">
        {hike.imageUrl && (
          <Image
            src={hike.imageUrl}
            alt={hike.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-stone-400">{hike.zona}</span>
          <span className={`text-xs uppercase tracking-wide font-medium ${DIFF_COLOR[hike.difficultyLevel]}`}>
            {hike.difficultyLevel}
          </span>
        </div>
        <h2 className="font-bold text-lg leading-tight text-stone-900 group-hover:text-stone-500 transition-colors">
          {hike.title}
        </h2>
        <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed">{hike.descrizione}</p>
        <div className="flex flex-wrap gap-x-4 text-xs text-stone-400 pt-1">
          <span>{hike.dislivello} ↑</span>
          <span>{hike.lunghezza}</span>
          <span>{hike.tempo}</span>
          <span>{hike.da_base} 🚗</span>
        </div>
      </div>
    </Link>
  )
}
