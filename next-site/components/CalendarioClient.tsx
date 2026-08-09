'use client'
import { useState, useEffect, useTransition, useRef, useMemo } from 'react'
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
  const [selected, setSelected] = useState<string | null>(null) // tap-to-assign (mobile)
  const [view, setView] = useState<ViewMode>('griglia')
  const [, startTransition] = useTransition()
  const hikeBySlug = useRef(new Map(hikes.map(h => [h.slug, h])))

  useEffect(() => {
    if (window.matchMedia('(max-width: 639px)').matches) setView('agenda')
  }, [])

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

  function assignHike(slug: string, dateKey: string) {
    save({ ...schedule, [dateKey]: [...(schedule[dateKey] ?? []), slug] })
  }

  function onDrop(dateKey: string) {
    if (!dragging) return
    assignHike(dragging, dateKey)
    setDragging(null)
    setOver(null)
  }

  function onDayClick(dateKey: string) {
    if (!selected) return
    assignHike(selected, dateKey)
    setSelected(null)
  }

  function removeFromDay(dateKey: string, idx: number) {
    const next = { ...schedule, [dateKey]: [...(schedule[dateKey] ?? [])] }
    next[dateKey].splice(idx, 1)
    save(next)
  }

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

  const selectedHike = selected ? hikeBySlug.current.get(selected) : null

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Tap-to-assign banner (mobile) ── */}
      <AnimatePresence>
        {selected && selectedHike && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            className="sticky top-0 z-50 bg-stone-900 text-white px-4 py-3 flex items-center gap-3 shadow-lg"
          >
            <span className={`shrink-0 w-2 h-2 rounded-full ${DIFF_DOT[selectedHike.difficultyLevel]}`} />
            <p className="flex-1 text-sm font-medium truncate">{selectedHike.title}</p>
            <p className="text-xs text-stone-400 shrink-0">Tocca un giorno</p>
            <button
              onClick={() => setSelected(null)}
              className="shrink-0 text-stone-400 hover:text-white transition-colors text-lg leading-none ml-1"
              aria-label="Annulla selezione"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-stone-900 mb-1">Agosto 2026</h1>
            <p className="text-sm text-stone-400">10 – 23 agosto · Trascina o tocca le gite</p>
          </div>
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
              <div className="grid grid-cols-7 gap-1 mb-12">
                {DAYS_IT.map(d => (
                  <div key={d} className="text-center text-xs font-semibold uppercase tracking-widest text-stone-400 pb-2">
                    {d}
                  </div>
                ))}
                {DATES.map(({ key, day }) => {
                  const slugs = schedule[key] ?? []
                  const isOver = over === key
                  const isTarget = !!selected // highlight droppable days when a hike is selected
                  return (
                    <div
                      key={key}
                      onDragOver={e => { e.preventDefault(); setOver(key) }}
                      onDragLeave={() => setOver(null)}
                      onDrop={() => onDrop(key)}
                      onClick={() => onDayClick(key)}
                      className={`min-h-28 rounded-lg border p-2 transition-colors duration-150 ${
                        isOver
                          ? 'border-stone-400 bg-stone-100'
                          : isTarget
                          ? 'border-stone-300 bg-stone-50 cursor-pointer'
                          : 'border-stone-200 bg-white'
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
              <div className="overflow-y-auto max-h-[60vh] rounded-xl border border-stone-200 bg-white divide-y divide-stone-100">
                {DATES.filter(({ key }) => (schedule[key] ?? []).length > 0).length === 0 ? (
                  <p className="text-sm text-stone-400 text-center py-16">
                    Nessuna gita pianificata — vai in vista griglia e trascina o tocca le card
                  </p>
                ) : (
                  DATES.map(({ key, day, dow }) => {
                    const slugs = schedule[key] ?? []
                    if (slugs.length === 0) return null
                    return (
                      <div key={key} className="flex gap-4 p-5">
                        {/* Date column */}
                        <div className="shrink-0 w-14 text-center pt-0.5">
                          <p className="text-xs uppercase tracking-widest text-stone-400">{dow}</p>
                          <p className="font-serif text-3xl font-bold text-stone-900 leading-none">{day}</p>
                          <p className="text-xs text-stone-400">{MONTHS_IT[7]}</p>
                        </div>

                        {/* Hikes */}
                        <div className="flex-1 min-w-0 flex flex-col gap-4">
                          {slugs.map((slug, idx) => {
                            const h = hikeBySlug.current.get(slug)
                            if (!h) return null
                            return (
                              <div key={`${slug}-${idx}`} className="group relative">
                                {/* Mobile: full card with image */}
                                <div className="sm:hidden">
                                  <Link href={h.href} className="block">
                                    <HikeCard hike={h} />
                                  </Link>
                                </div>

                                {/* Desktop: compact row */}
                                <div className="hidden sm:flex items-center gap-3 rounded-lg border border-stone-100 px-4 py-3 hover:border-stone-300 transition-colors">
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

                                {/* Mobile remove button */}
                                <button
                                  onClick={() => removeFromDay(key, idx)}
                                  className="sm:hidden absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center text-stone-400 hover:text-stone-700 text-sm shadow"
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

        {/* Hike palette */}
        <div className="border-t border-stone-100 pt-12">
          <motion.h2
            className="text-xs uppercase tracking-widest font-semibold text-stone-400 mb-10"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease }}
          >
            {availableHikes.length > 0
              ? 'Gite disponibili — trascina o tocca per selezionare'
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
                    className={`relative cursor-grab active:cursor-grabbing transition-all duration-150 ${
                      dragging === h.slug ? 'opacity-40 scale-95' : ''
                    }`}
                  >
                    {/* Transparent overlay: captures tap for mobile select, doesn't break desktop drag */}
                    <div
                      className="absolute inset-0 z-10 rounded-lg"
                      onClick={() => setSelected(h.slug === selected ? null : h.slug)}
                    />
                    {/* Selection ring */}
                    {selected === h.slug && (
                      <div className="absolute inset-0 z-20 rounded-lg ring-2 ring-stone-900 pointer-events-none" />
                    )}
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
