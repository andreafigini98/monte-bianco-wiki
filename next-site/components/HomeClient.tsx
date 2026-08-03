'use client'
import { useState, useMemo } from 'react'
import type { Hike, DifficultyLevel, Zona } from '@/lib/hikes'
import HikeCard from '@/components/HikeCard'
import FilterBar from '@/components/FilterBar'

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
      <div className="py-16 md:py-24 border-b border-stone-100 space-y-4">
        <p className="text-xs uppercase tracking-widest text-stone-400">Valle d&apos;Aosta · Estate 2026</p>
        <h1 className="font-serif text-5xl md:text-7xl font-bold leading-none text-stone-900">
          {hikes.length} gite<br />da scoprire
        </h1>
        <p className="text-stone-500 text-lg max-w-xl leading-relaxed">
          Base: Camping Monte Bianco, Sarre. Gran Paradiso, Monte Bianco, Cervino, Monte Rosa — tutto a meno di 1h30 d&apos;auto.
        </p>
      </div>

      <div className="py-8 border-b border-stone-100">
        <FilterBar
          difficulty={difficulty}
          zona={zona}
          onDifficulty={setDifficulty}
          onZona={setZona}
          total={hikes.length}
          filtered={filtered.length}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-stone-400 py-24 text-center text-sm">Nessuna gita corrisponde ai filtri selezionati.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14 py-14">
          {filtered.map(h => <HikeCard key={h.slug} hike={h} />)}
        </div>
      )}
    </main>
  )
}
