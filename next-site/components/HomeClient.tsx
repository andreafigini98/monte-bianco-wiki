'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Hike, DifficultyLevel, Zona } from '@/lib/hikes'
import HikeCard from '@/components/HikeCard'
import FilterBar from '@/components/FilterBar'

const ease = [0.22, 1, 0.36, 1] as const

const heroContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}
const heroItem = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.65, ease, delay: i * 0.05 },
  }),
  exit: { opacity: 0, scale: 0.94, filter: 'blur(4px)', transition: { duration: 0.18 } },
}

export default function HomeClient({ hikes }: { hikes: Hike[] }) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel | ''>('')
  const [zona, setZona] = useState<Zona | ''>('')

  const filtered = useMemo(
    () => hikes.filter(h =>
      (!difficulty || h.difficultyLevel === difficulty) &&
      (!zona || h.zona === zona)
    ),
    [hikes, difficulty, zona]
  )

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-12">

      {/* Hero */}
      <motion.div
        className="relative py-16 md:py-28 border-b border-stone-100 overflow-hidden"
        variants={heroContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Decorative large background number */}
        <motion.span
          className="absolute right-0 top-1/2 -translate-y-1/2 font-serif font-bold text-[20vw] leading-none text-stone-50 select-none pointer-events-none"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease, delay: 0.2 }}
        >
          {hikes.length}
        </motion.span>

        <div className="relative space-y-5 max-w-3xl">
          <motion.p
            className="text-xs uppercase tracking-widest text-stone-400"
            variants={heroItem}
          >
            Valle d&apos;Aosta · Estate 2026
          </motion.p>

          <motion.h1
            className="font-serif text-6xl md:text-8xl font-bold leading-none text-stone-900"
            variants={heroItem}
          >
            {hikes.length} gite<br />
            <span className="text-stone-400">da scoprire.</span>
          </motion.h1>

          {/* Animated divider line */}
          <motion.div
            className="h-px bg-stone-200 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, ease, delay: 0.45 }}
          />

          <motion.p
            className="text-stone-500 text-lg max-w-xl leading-relaxed"
            variants={heroItem}
          >
            Base: Camping Monte Bianco, Sarre. Gran Paradiso, Monte Bianco,
            Cervino, Monte Rosa — tutto a meno di 1h30 d&apos;auto.
          </motion.p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="py-8 border-b border-stone-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <FilterBar
          difficulty={difficulty}
          zona={zona}
          onDifficulty={setDifficulty}
          onZona={setZona}
          total={hikes.length}
          filtered={filtered.length}
        />
      </motion.div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <motion.p
          className="text-stone-400 py-24 text-center text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Nessuna gita corrisponde ai filtri selezionati.
        </motion.p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14 py-14">
          <AnimatePresence mode="popLayout">
            {filtered.map((h, i) => (
              <motion.div
                key={h.slug}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >
                <HikeCard hike={h} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </main>
  )
}
