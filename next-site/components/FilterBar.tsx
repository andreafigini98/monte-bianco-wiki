'use client'
import { motion, AnimatePresence } from 'framer-motion'
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

function Pill({
  label,
  active,
  onClick,
  layoutId,
}: {
  label: string
  active: boolean
  onClick: () => void
  layoutId: string
}) {
  return (
    <button
      onClick={onClick}
      className="relative px-4 py-1.5 rounded-full text-sm capitalize border transition-colors overflow-hidden"
      style={{ borderColor: active ? 'transparent' : undefined }}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 bg-stone-900 rounded-full"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }}
        />
      )}
      <span className={`relative z-10 transition-colors duration-200 ${active ? 'text-white' : 'text-stone-600 border-stone-200'}`}>
        {label}
      </span>
    </button>
  )
}

export default function FilterBar({ difficulty, zona, onDifficulty, onZona, total, filtered }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        {DIFFICULTIES.map(d => (
          <Pill
            key={d}
            label={d}
            active={difficulty === d}
            onClick={() => onDifficulty(difficulty === d ? '' : d)}
            layoutId={`diff-${d}`}
          />
        ))}
        <span className="w-px h-5 bg-stone-200 mx-1" />
        {ZONE.map(z => (
          <Pill
            key={z}
            label={z}
            active={zona === z}
            onClick={() => onZona(zona === z ? '' : z)}
            layoutId={`zona-${z}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-stone-400">
        <motion.span
          key={filtered}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {filtered === total ? `${total} gite` : `${filtered} di ${total} gite`}
        </motion.span>
        <AnimatePresence>
          {(difficulty || zona) && (
            <motion.button
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              onClick={() => { onDifficulty(''); onZona('') }}
              className="underline hover:text-stone-700 transition-colors"
            >
              Azzera filtri
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
