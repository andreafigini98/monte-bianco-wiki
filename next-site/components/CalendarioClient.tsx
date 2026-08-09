'use client'
import { useState, useTransition, useRef } from 'react'
import Link from 'next/link'
import type { Hike, DifficultyLevel } from '@/lib/hikes'
import type { Schedule } from '@/lib/calendario'
import { persistSchedule } from '@/app/actions/calendario'

const DIFF_BG: Record<DifficultyLevel, string> = {
  'facile': 'bg-emerald-100 text-emerald-700',
  'media': 'bg-amber-100 text-amber-700',
  'impegnativa': 'bg-orange-100 text-orange-700',
  'molto impegnativa': 'bg-red-100 text-red-700',
}

const DIFF_DOT: Record<DifficultyLevel, string> = {
  'facile': 'bg-emerald-500',
  'media': 'bg-amber-500',
  'impegnativa': 'bg-orange-500',
  'molto impegnativa': 'bg-red-500',
}

const DAYS_IT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

// Aug 10–23 2026 — Aug 10 is Monday, so days align perfectly with Mon–Sun columns
const DATES = Array.from({ length: 14 }, (_, i) => ({
  key: `2026-08-${String(10 + i).padStart(2, '0')}`,
  day: 10 + i,
}))

export default function CalendarioClient({
  hikes,
  initialSchedule,
}: {
  hikes: Hike[]
  initialSchedule: Schedule
}) {
  const [schedule, setSchedule] = useState<Schedule>(initialSchedule)
  const [dragging, setDragging] = useState<string | null>(null)
  const [over, setOver] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const hikeBySlug = useRef(new Map(hikes.map(h => [h.slug, h])))

  function save(next: Schedule) {
    setSchedule(next)
    startTransition(() => persistSchedule(next))
  }

  function onDrop(dateKey: string) {
    if (!dragging) return
    save({ ...schedule, [dateKey]: [...(schedule[dateKey] ?? []), dragging] })
    setDragging(null)
    setOver(null)
  }

  function removeFromDay(dateKey: string, idx: number) {
    const next = { ...schedule, [dateKey]: [...(schedule[dateKey] ?? [])] }
    next[dateKey].splice(idx, 1)
    save(next)
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-1">Agosto 2026</h1>
        <p className="text-sm text-stone-400 mb-8">10 – 23 agosto · Trascina le gite sui giorni</p>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 mb-12">
          {DAYS_IT.map(d => (
            <div key={d} className="text-center text-xs font-semibold uppercase tracking-widest text-stone-400 pb-2">
              {d}
            </div>
          ))}
          {DATES.map(({ key, day }) => {
            const slugs = schedule[key] ?? []
            const isOver = over === key
            return (
              <div
                key={key}
                onDragOver={e => { e.preventDefault(); setOver(key) }}
                onDragLeave={() => setOver(null)}
                onDrop={() => onDrop(key)}
                className={`min-h-28 rounded-lg border p-2 transition-colors duration-150 ${
                  isOver ? 'border-stone-400 bg-stone-100' : 'border-stone-200 bg-white'
                }`}
              >
                <span className="text-xs font-semibold text-stone-400 mb-1 block">{day}</span>
                <div className="flex flex-col gap-1">
                  {slugs.map((slug, idx) => {
                    const h = hikeBySlug.current.get(slug)
                    if (!h) return null
                    return (
                      <div key={`${slug}-${idx}`} className="group flex items-start gap-1">
                        <Link
                          href={h.href}
                          className="flex-1 min-w-0 flex items-center gap-1.5 rounded px-1.5 py-1 bg-stone-50 hover:bg-stone-100 transition-colors"
                        >
                          <span className={`shrink-0 w-1.5 h-1.5 rounded-full mt-0.5 ${DIFF_DOT[h.difficultyLevel]}`} />
                          <span className="text-xs text-stone-700 leading-snug line-clamp-2">{h.title}</span>
                        </Link>
                        <button
                          onClick={() => removeFromDay(key, idx)}
                          className="shrink-0 opacity-0 group-hover:opacity-100 text-stone-300 hover:text-stone-600 transition-opacity text-xs leading-none mt-1"
                          aria-label="Rimuovi"
                        >
                          ×
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Hike palette */}
        <div>
          <h2 className="text-xs uppercase tracking-widest font-semibold text-stone-400 mb-4">
            Gite disponibili — trascina sul calendario
          </h2>
          <div className="flex flex-wrap gap-2">
            {hikes.map(h => (
              <div
                key={h.slug}
                draggable
                onDragStart={() => setDragging(h.slug)}
                onDragEnd={() => setDragging(null)}
                className={`cursor-grab active:cursor-grabbing select-none flex items-center gap-2 rounded-lg border px-3 py-2 bg-white hover:border-stone-400 transition-all duration-150 ${
                  dragging === h.slug ? 'opacity-50 scale-95' : 'opacity-100'
                }`}
              >
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${DIFF_BG[h.difficultyLevel]}`}>
                  {h.difficultyLevel}
                </span>
                <span className="text-sm text-stone-700 font-medium">{h.title}</span>
                <span className="text-xs text-stone-400">{h.tempo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
