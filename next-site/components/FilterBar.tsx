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
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={difficulty}
        onChange={e => onDifficulty(e.target.value as DifficultyLevel | '')}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
      >
        <option value="">Tutte le difficoltà</option>
        {DIFFICULTIES.map(d => (
          <option key={d} value={d} className="capitalize">{d}</option>
        ))}
      </select>

      <select
        value={zona}
        onChange={e => onZona(e.target.value as Zona | '')}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
      >
        <option value="">Tutte le zone</option>
        {ZONE.map(z => (
          <option key={z} value={z}>{z}</option>
        ))}
      </select>

      {(difficulty || zona) && (
        <button
          onClick={() => { onDifficulty(''); onZona('') }}
          className="text-xs text-slate-500 underline"
        >
          Azzera filtri
        </button>
      )}

      <span className="ml-auto text-sm text-slate-500">
        {filtered === total ? `${total} gite` : `${filtered} di ${total} gite`}
      </span>
    </div>
  )
}
