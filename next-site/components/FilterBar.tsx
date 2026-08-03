'use client'
import type { DifficultyLevel, Zona } from '@/lib/hikes'

const DIFFICULTIES: DifficultyLevel[] = ['facile', 'media', 'impegnativa', 'molto impegnativa']
const ZONE: Zona[] = ['Gran Paradiso', 'Monte Bianco', 'Cervino', 'Monte Rosa', 'Valpelline']

type Props = {
  difficulty: DifficultyLevel | ''
  zona: Zona | ''
  onDifficulty: (v: DifficultyLevel | '') => void
  onZona: (v: Zona | '') => void
  total: number
  filtered: number
}

export default function FilterBar({ difficulty, zona, onDifficulty, onZona, total, filtered }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {DIFFICULTIES.map(d => (
          <button
            key={d}
            onClick={() => onDifficulty(difficulty === d ? '' : d)}
            className={`px-4 py-1.5 rounded-full text-sm capitalize border transition-colors ${
              difficulty === d
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-500'
            }`}
          >
            {d}
          </button>
        ))}
        <span className="w-px bg-stone-200 mx-1 self-stretch" />
        {ZONE.map(z => (
          <button
            key={z}
            onClick={() => onZona(zona === z ? '' : z)}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
              zona === z
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-500'
            }`}
          >
            {z}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-stone-400">
        <span>
          {filtered === total ? `${total} gite` : `${filtered} di ${total} gite`}
        </span>
        {(difficulty || zona) && (
          <button
            onClick={() => { onDifficulty(''); onZona('') }}
            className="underline hover:text-stone-700 transition-colors"
          >
            Azzera filtri
          </button>
        )}
      </div>
    </div>
  )
}
