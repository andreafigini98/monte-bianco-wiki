'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Hike, DifficultyLevel } from '@/lib/hikes'
import HikeCard from '@/components/HikeCard'

const ease = [0.22, 1, 0.36, 1] as const

const heroContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}
const heroItem = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease } },
}

const DIFFICULTIES: { level: DifficultyLevel; label: string; color: string }[] = [
  { level: 'facile',             label: 'Facile',             color: '#10b981' },
  { level: 'media',              label: 'Media',              color: '#eab308' },
  { level: 'impegnativa',        label: 'Impegnativa',        color: '#f97316' },
  { level: 'molto impegnativa',  label: 'Molto Impegnativa',  color: '#ef4444' },
]

function DifficultySection({
  difficulty,
  hikes,
  index,
}: {
  difficulty: (typeof DIFFICULTIES)[number]
  hikes: Hike[]
  index: number
}) {
  if (hikes.length === 0) return null

  return (
    <section className="border-t border-stone-100 py-20">

      {/* ── Section header ── */}
      <div className="mb-12">

        {/* Row: number + intensity bars */}
        <div className="flex items-center justify-between mb-5">
          <motion.span
            className="text-[10px] uppercase tracking-widest text-stone-300 tabular-nums"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, ease }}
          >
            {String(index + 1).padStart(2, '0')}
          </motion.span>

        </div>

        {/* Big serif title in difficulty color */}
        <motion.h2
          className="font-serif font-bold leading-none"
          style={{ color: difficulty.color, fontSize: 'clamp(3rem, 8vw, 6rem)' }}
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
        >
          {difficulty.label}
        </motion.h2>

        {/* Colored animated rule */}
        <motion.div
          className="h-px mt-5 origin-left"
          style={{ background: difficulty.color }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, ease, delay: 0.25 }}
        />

        {/* Hike count */}
        <motion.p
          className="text-xs uppercase tracking-widest text-stone-400 mt-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          {hikes.length} {hikes.length === 1 ? 'gita' : 'gite'}
        </motion.p>
      </div>

      {/* ── Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
        {hikes.map((h, i) => (
          <motion.div
            key={h.slug}
            initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, ease, delay: i * 0.04 }}
          >
            <HikeCard hike={h} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default function HomeClient({ hikes }: { hikes: Hike[] }) {
  const grouped = useMemo(
    () => DIFFICULTIES.map(d => ({ ...d, hikes: hikes.filter(h => h.difficultyLevel === d.level) })),
    [hikes],
  )

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-12">

      {/* ── Hero ── */}
      <motion.div
        className="relative py-16 md:py-28 border-b border-stone-100 overflow-hidden"
        variants={heroContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Decorative background number */}
        <motion.span
          className="absolute right-0 top-1/2 -translate-y-1/2 font-serif font-bold text-[20vw] leading-none text-stone-50 select-none pointer-events-none"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease, delay: 0.2 }}
        >
          {hikes.length}
        </motion.span>

        <div className="relative space-y-5 max-w-3xl">
          <motion.p className="text-xs uppercase tracking-widest text-stone-400" variants={heroItem}>
            Valle d&apos;Aosta · Estate 2026
          </motion.p>

          <motion.h1
            className="font-serif text-6xl md:text-8xl font-bold leading-none text-stone-900"
            variants={heroItem}
          >
            {hikes.length} gite<br />
            <span className="text-stone-400">da scoprire.</span>
          </motion.h1>

          <motion.div
            className="h-px bg-stone-200 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, ease, delay: 0.45 }}
          />

          <motion.p className="text-stone-500 text-lg max-w-xl leading-relaxed" variants={heroItem}>
            Base: Camping Monte Bianco, Sarre. Gran Paradiso, Monte Bianco,
            Cervino, Monte Rosa — tutto a meno di 1h30 d&apos;auto.
          </motion.p>
        </div>
      </motion.div>

      {/* ── Difficulty sections ── */}
      {grouped.map((d, i) => (
        <DifficultySection key={d.level} difficulty={d} hikes={d.hikes} index={i} />
      ))}

    </main>
  )
}
