'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { DifficultyLevel } from '@/lib/hikes'
import MapWrapper from '@/components/MapWrapper'

const ease = [0.22, 1, 0.36, 1] as const

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.6, ease, delay },
})

const DIFF_COLOR: Record<DifficultyLevel, string> = {
  'facile': 'text-emerald-600',
  'media': 'text-amber-600',
  'impegnativa': 'text-orange-600',
  'molto impegnativa': 'text-red-600',
}

type Stat = { label: string; value: string }

type Props = {
  slug: string
  title: string
  zona: string
  difficultyLevel: DifficultyLevel
  difficolta: string
  descrizione: string
  coordinate: string
  stats: Stat[]
  contentHtml: string
}

export default function HikePageContent({
  slug, title, zona, difficultyLevel, descrizione, coordinate, stats, contentHtml,
}: Props) {
  const [lat, lng] = coordinate.split(',').map(Number)
  const hasMap = coordinate && !isNaN(lat) && !isNaN(lng)

  return (
    <main className="max-w-3xl mx-auto px-6 md:px-12 py-12 space-y-10">

      <motion.div {...fadeUp(0)}>
        <Link
          href="/"
          className="text-xs uppercase tracking-widest text-stone-400 hover:text-stone-700 transition-colors"
        >
          ← Tutte le gite
        </Link>
      </motion.div>

      {/* Header */}
      <div className="border-b border-stone-100 pb-10 space-y-4">
        <motion.div className="flex items-center gap-3" {...fadeUp(0.08)}>
          <span className="text-xs uppercase tracking-widest text-stone-400">{zona}</span>
          <span className="text-stone-200">·</span>
          <span className={`text-xs uppercase tracking-wide font-medium capitalize ${DIFF_COLOR[difficultyLevel]}`}>
            {difficultyLevel}
          </span>
        </motion.div>

        <motion.h1
          className="font-serif text-4xl md:text-5xl font-bold leading-tight text-stone-900"
          {...fadeUp(0.16)}
        >
          {title}
        </motion.h1>

        <motion.div
          className="h-px bg-stone-200 origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease, delay: 0.22 }}
        />

        <motion.p
          className="text-stone-500 text-lg leading-relaxed"
          {...fadeUp(0.28)}
        >
          {descrizione}
        </motion.p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {stats.map(({ label, value }, i) => (
          <motion.div key={label} className="space-y-1" {...fadeUp(0.1 + i * 0.07)}>
            <p className="text-xs uppercase tracking-widest text-stone-400">{label}</p>
            <p className="text-sm font-medium text-stone-900">{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Map */}
      {hasMap && (
        <motion.div
          className="h-72 overflow-hidden border border-stone-100"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.5 }}
        >
          <MapWrapper
            hikes={[{ slug, title, coordinate, difficultyLevel }]}
            zoom={13}
            center={[lat, lng]}
          />
        </motion.div>
      )}

      {/* Markdown body */}
      <motion.article
        className="prose prose-stone max-w-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.55 }}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </main>
  )
}
