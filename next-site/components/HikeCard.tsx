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
    <Link href={hike.href} className="group block">

      {/* Image */}
      <div className="aspect-[4/3] relative overflow-hidden bg-stone-100 mb-5 rounded-lg">
        {hike.imageUrl && (
          <Image
            src={hike.imageUrl}
            alt={hike.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/20 transition-colors duration-500" />
      </div>

      {/* Text */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-widest text-stone-400">{hike.zona}</span>
          <span className={`text-xs uppercase tracking-wide font-semibold ${DIFF_COLOR[hike.difficultyLevel]}`}>
            {hike.difficultyLevel}
          </span>
        </div>

        <h2 className="font-serif text-xl font-bold leading-tight text-stone-900 mb-2 group-hover:text-stone-500 transition-colors duration-300">
          {hike.title}
        </h2>

        <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed mb-4">{hike.descrizione}</p>

        {/* Stats — clean, no emoji */}
        <div className="flex items-center gap-3 text-xs text-stone-400">
          <span>{hike.dislivello} ↑</span>
          <span className="text-stone-200">·</span>
          <span>{hike.tempo}</span>
          <span className="text-stone-200">·</span>
          <span>{hike.da_base} in auto</span>
        </div>
      </div>

    </Link>
  )
}
