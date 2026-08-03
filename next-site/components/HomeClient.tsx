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
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-900">Gite in Valle d&apos;Aosta</h1>
        <p className="text-slate-500">Base: Camping Monte Bianco, Sarre — {hikes.length} gite verificate</p>
      </div>

      <FilterBar
        difficulty={difficulty}
        zona={zona}
        onDifficulty={setDifficulty}
        onZona={setZona}
        total={hikes.length}
        filtered={filtered.length}
      />

      {filtered.length === 0 ? (
        <p className="text-slate-500 py-12 text-center">Nessuna gita corrisponde ai filtri selezionati.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(h => <HikeCard key={h.slug} hike={h} />)}
        </div>
      )}
    </main>
  )
}
