'use client'
import { useState, useTransition, useRef, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import type { Hike, DifficultyLevel } from '@/lib/hikes'
import type { Schedule } from '@/lib/calendario'
import { persistSchedule } from '@/app/actions/calendario'
import HikeCard from '@/components/HikeCard'

const ease = [0.22, 1, 0.36, 1] as const

const DIFF_DOT: Record<DifficultyLevel, string> = {
  'facile': 'bg-emerald-500',
  'media': 'bg-amber-500',
  'impegnativa': 'bg-orange-500',
  'molto impegnativa': 'bg-red-500',
}

const DIFF_BADGE: Record<DifficultyLevel, string> = {
  'facile': 'bg-emerald-100 text-emerald-700',
  'media': 'bg-amber-100 text-amber-700',
  'impegnativa': 'bg-orange-100 text-orange-700',
  'molto impegnativa': 'bg-red-100 text-red-700',
}

const DAYS_IT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
const MONTHS_IT = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']

// Aug 10–23 2026 — Aug 10 is Monday, so days align perfectly with Mon–Sun columns
const DATES = Array.from({ length: 14 }, (_, i) => ({
  key: `2026-08-${String(10 + i).padStart(2, '0')}`,
  day: 10 + i,
  dow: DAYS_IT[i % 7],
}))

type ViewMode = 'griglia' | 'agenda'

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
  const [view, setView] = useState<ViewMode>('griglia')
  const [, startTransition] = useTransition()
  const hikeBySlug = useRef(new Map(hikes.map(h => [h.slug, h])))

  const scheduledSlugs = useMemo(
    () => new Set(Object.values(schedule).flat()),
    [schedule],
  )

  const availableHikes = useMemo(
    () => hikes.filter(h => !scheduledSlugs.has(h.slug)),
    [hikes, scheduledSlugs],
  )

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

  // Shared chip used in both calendar grid and agenda
  function HikeChip({ slug, dateKey, idx }: { slug: string; dateKey: string; idx: number }) {
    const h = hikeBySlug.current.get(slug)
    if (!h) return null
    return (
      <div className="group flex items-start gap-1">
        <Link
          href={h.href}
          className="flex-1 min-w-0 flex items-center gap-1.5 rounded px-1.5 py-1 bg-stone-50 hover:bg-stone-100 transition-colors"
        >
          <span className={`shrink-0 w-1.5 h-1.5 rounded-full mt-0.5 ${DIFF_DOT[h.difficultyLevel]}`} />
          <span className="text-xs text-stone-700 leading-snug line-clamp-2">{h.title}</span>
        </Link>
        <button
          onClick={() => removeFromDay(dateKey, idx)}
          className="shrink-0 opacity-0 group-hover:opacity-100 text-stone-300 hover:text-stone-600 transition-opacity text-xs leading-none mt-1"
          aria-label="Rimuovi"
        >
          ×
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-stone-900 mb-1">Agosto 2026</h1>
            <p className="text-sm text-stone-400">10 – 23 agosto · Trascina le gite sui giorni</p>
          </div>
          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white p-1 shrink-0">
            {(['griglia', 'agenda'] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`relative px-3 py-1.5 text-xs font-semibold uppercase tracking-widest rounded transition-colors duration-150 ${
                  view === v ? 'text-stone-900' : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                {view === v && (
                  <motion.span
                    layoutId="view-bg"
                    className="absolute inset-0 bg-stone-100 rounded"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                  />
                )}
                <span className="relative">{v}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === 'griglia' ? (
            <motion.div
              key="griglia"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease }}
            >
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
                        {slugs.map((slug, idx) => (
                          <HikeChip key={`${slug}-${idx}`} slug={slug} dateKey={key} idx={idx} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="agenda"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease }}
              className="mb-12"
            >
              {/* Agenda view — scrollable, only days with hikes */}
              <div className="overflow-y-auto max-h-[60vh] rounded-xl border border-stone-200 bg-white divide-y divide-stone-100">
                {DATES.filter(({ key }) => (schedule[key] ?? []).length > 0).length === 0 ? (
                  <p className="text-sm text-stone-400 text-center py-16">
                    Nessuna gita pianificata — trascina le card sul calendario in vista griglia
                  </p>
                ) : (
                  DATES.map(({ key, day, dow }) => {
                    const slugs = schedule[key] ?? []
                    if (slugs.length === 0) return null
                    const h0 = hikeBySlug.current.get(slugs[0])
                    return (
                      <div key={key} className="flex gap-6 p-5">
                        {/* Date column */}
                        <div className="shrink-0 w-16 text-center pt-0.5">
                          <p className="text-xs uppercase tracking-widest text-stone-400">{dow}</p>
                          <p className="font-serif text-3xl font-bold text-stone-900 leading-none">{day}</p>
                          <p className="text-xs text-stone-400">{MONTHS_IT[7]}</p>
                        </div>
                        {/* Hikes for this day */}
                        <div className="flex-1 flex flex-col gap-3">
                          {slugs.map((slug, idx) => {
                            const h = hikeBySlug.current.get(slug)
                            if (!h) return null
                            return (
                              <div key={`${slug}-${idx}`} className="group flex items-center gap-3 rounded-lg border border-stone-100 px-4 py-3 hover:border-stone-300 transition-colors">
                                <span className={`shrink-0 w-2 h-2 rounded-full ${DIFF_DOT[h.difficultyLevel]}`} />
                                <Link href={h.href} className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-stone-800 truncate group-hover:text-stone-500 transition-colors">{h.title}</p>
                                  <p className="text-xs text-stone-400 mt-0.5 flex gap-3">
                                    <span>{h.dislivello} ↑</span>
                                    <span>{h.tempo}</span>
                                    <span className={`font-medium px-1.5 rounded ${DIFF_BADGE[h.difficultyLevel]}`}>{h.difficultyLevel}</span>
                                  </p>
                                </Link>
                                <button
                                  onClick={() => removeFromDay(key, idx)}
                                  className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-stone-600 transition-opacity text-sm"
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
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hike palette — hikes already in schedule are hidden */}
        <div className="border-t border-stone-100 pt-12">
          <motion.h2
            className="text-xs uppercase tracking-widest font-semibold text-stone-400 mb-10"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease }}
          >
            {availableHikes.length > 0
              ? `Gite disponibili — trascina sul calendario${view === 'agenda' ? ' (passa a vista griglia)' : ''}`
              : 'Tutte le gite sono nel calendario'}
          </motion.h2>

          {availableHikes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              <AnimatePresence>
                {availableHikes.map((h, i) => (
                  <motion.div
                    key={h.slug}
                    draggable
                    onDragStart={() => setDragging(h.slug)}
                    onDragEnd={() => setDragging(null)}
                    layout
                    initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                    transition={{ duration: 0.35, ease, delay: i * 0.03 }}
                    className={`cursor-grab active:cursor-grabbing transition-all duration-150 ${
                      dragging === h.slug ? 'opacity-40 scale-95' : ''
                    }`}
                  >
                    <HikeCard hike={h} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
