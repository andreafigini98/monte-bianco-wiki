'use client'
import { useState, useEffect, useTransition, useRef, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import type { Hike, DifficultyLevel } from '@/lib/hikes'
import type { Attivita } from '@/lib/activities'
import type { Schedule } from '@/lib/calendario'
import { persistSchedule } from '@/app/actions/calendario'
import HikeCard from '@/components/HikeCard'

const ease = [0.22, 1, 0.36, 1] as const

const DIFFICULTIES: { level: DifficultyLevel; label: string; color: string }[] = [
  { level: 'facile',            label: 'Facile',            color: '#10b981' },
  { level: 'media',             label: 'Media',             color: '#eab308' },
  { level: 'impegnativa',       label: 'Impegnativa',       color: '#f97316' },
  { level: 'molto impegnativa', label: 'Molto Impegnativa', color: '#ef4444' },
]

const DISABLED_DAYS = new Set(['2026-08-10', '2026-08-11', '2026-08-12', '2026-08-13', '2026-08-23'])

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

// Activities use "act:" prefix in schedule to avoid collisions with hike slugs
const ACT_PREFIX = 'act:'
const actKey = (id: string) => `${ACT_PREFIX}${id}`
const isActKey = (key: string) => key.startsWith(ACT_PREFIX)
const actId = (key: string) => key.slice(ACT_PREFIX.length)

export default function CalendarioClient({
  hikes,
  attivita,
  initialSchedule,
}: {
  hikes: Hike[]
  attivita: Attivita[]
  initialSchedule: Schedule
}) {
  const [schedule, setSchedule] = useState<Schedule>(initialSchedule)
  const [dragging, setDragging] = useState<string | null>(null)
  const [over, setOver] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [view, setView] = useState<ViewMode>('griglia')
  const [, startTransition] = useTransition()
  const hikeBySlug = useRef(new Map(hikes.map(h => [h.slug, h])))
  const activityById = useRef(new Map(attivita.map(a => [a.id, a])))

  useEffect(() => {
    if (window.matchMedia('(max-width: 639px)').matches) setView('agenda')
  }, [])

  const scheduledKeys = useMemo(
    () => new Set(Object.values(schedule).flat()),
    [schedule],
  )

  const availableHikes = useMemo(
    () => hikes.filter(h => !scheduledKeys.has(h.slug)),
    [hikes, scheduledKeys],
  )

  const availableAttivita = useMemo(
    () => attivita.filter(a => !scheduledKeys.has(actKey(a.id))),
    [attivita, scheduledKeys],
  )

  function save(next: Schedule) {
    setSchedule(next)
    startTransition(() => persistSchedule(next))
  }

  function assign(itemKey: string, dateKey: string) {
    save({ ...schedule, [dateKey]: [...(schedule[dateKey] ?? []), itemKey] })
  }

  function onDrop(dateKey: string) {
    if (!dragging) return
    assign(dragging, dateKey)
    setDragging(null)
    setOver(null)
  }

  function onDayClick(dateKey: string) {
    if (!selected) return
    assign(selected, dateKey)
    setSelected(null)
  }

  function removeFromDay(dateKey: string, idx: number) {
    const next = { ...schedule, [dateKey]: [...(schedule[dateKey] ?? [])] }
    next[dateKey].splice(idx, 1)
    save(next)
  }

  // Chip inside calendar cell — works for both hikes and activities
  function ItemChip({ itemKey, dateKey, idx }: { itemKey: string; dateKey: string; idx: number }) {
    if (isActKey(itemKey)) {
      const a = activityById.current.get(actId(itemKey))
      if (!a) return null
      return (
        <div className="group flex items-start gap-1">
          <div className="flex-1 min-w-0 flex items-center gap-1.5 rounded px-1.5 py-1 bg-amber-50">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full mt-0.5 bg-amber-500" />
            <span className="text-xs text-stone-700 leading-snug line-clamp-2">{a.title}</span>
          </div>
          <button
            onClick={() => removeFromDay(dateKey, idx)}
            className="shrink-0 opacity-0 group-hover:opacity-100 text-stone-300 hover:text-stone-600 transition-opacity text-xs leading-none mt-1"
            aria-label="Rimuovi"
          >×</button>
        </div>
      )
    }
    const h = hikeBySlug.current.get(itemKey)
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
        >×</button>
      </div>
    )
  }

  // What the sticky banner shows when an item is selected (mobile tap-to-assign)
  const selectedLabel = selected
    ? isActKey(selected)
      ? activityById.current.get(actId(selected))?.title ?? null
      : hikeBySlug.current.get(selected)?.title ?? null
    : null

  function PaletteCard({ itemKey, children }: { itemKey: string; children: React.ReactNode }) {
    return (
      <motion.div
        draggable
        onDragStart={() => setDragging(itemKey)}
        onDragEnd={() => setDragging(null)}
        layout
        initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
        transition={{ duration: 0.35, ease }}
        className={`relative cursor-grab active:cursor-grabbing transition-all duration-150 ${
          dragging === itemKey ? 'opacity-40 scale-95' : ''
        }`}
      >
        <div
          className="absolute inset-0 z-10 rounded-lg"
          onClick={() => setSelected(itemKey === selected ? null : itemKey)}
        />
        {selected === itemKey && (
          <div className="absolute inset-0 z-20 rounded-lg ring-2 ring-stone-900 pointer-events-none" />
        )}
        {children}
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">

      {/* Tap-to-assign banner */}
      <AnimatePresence>
        {selected && selectedLabel && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            className="sticky top-0 z-50 bg-stone-900 text-white px-4 py-3 flex items-center gap-3 shadow-lg"
          >
            <span className={`shrink-0 w-2 h-2 rounded-full ${isActKey(selected) ? 'bg-amber-400' : 'bg-stone-400'}`} />
            <p className="flex-1 text-sm font-medium truncate">{selectedLabel}</p>
            <p className="text-xs text-stone-400 shrink-0">Tocca un giorno</p>
            <button onClick={() => setSelected(null)} className="shrink-0 text-stone-400 hover:text-white transition-colors text-lg leading-none ml-1" aria-label="Annulla">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-stone-900 mb-1">Agosto 2026</h1>
            <p className="text-sm text-stone-400">10 – 23 agosto · Trascina o tocca le card</p>
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
                  <motion.span layoutId="view-bg" className="absolute inset-0 bg-stone-100 rounded" transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }} />
                )}
                <span className="relative">{v}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === 'griglia' ? (
            <motion.div key="griglia" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease }}>
              <div className="grid grid-cols-7 gap-1 mb-12">
                {DAYS_IT.map(d => (
                  <div key={d} className="text-center text-xs font-semibold uppercase tracking-widest text-stone-400 pb-2">{d}</div>
                ))}
                {DATES.map(({ key, day }) => {
                  const keys = schedule[key] ?? []
                  const isOver = over === key
                  const disabled = DISABLED_DAYS.has(key)
                  return (
                    <div
                      key={key}
                      onDragOver={e => { if (!disabled) { e.preventDefault(); setOver(key) } }}
                      onDragLeave={() => setOver(null)}
                      onDrop={() => { if (!disabled) onDrop(key) }}
                      onClick={() => { if (!disabled) onDayClick(key) }}
                      className={`min-h-28 rounded-lg border p-2 transition-colors duration-150 ${
                        disabled ? 'border-stone-100 bg-stone-50 opacity-40 cursor-not-allowed'
                        : isOver ? 'border-stone-400 bg-stone-100'
                        : selected ? 'border-stone-300 bg-stone-50 cursor-pointer'
                        : 'border-stone-200 bg-white'
                      }`}
                    >
                      <span className="text-xs font-semibold text-stone-400 mb-1 block">{day}</span>
                      <div className="flex flex-col gap-1">
                        {keys.map((k, idx) => <ItemChip key={`${k}-${idx}`} itemKey={k} dateKey={key} idx={idx} />)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div key="agenda" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease }} className="mb-12">
              <div className="overflow-y-auto max-h-[60vh] rounded-xl border border-stone-200 bg-white divide-y divide-stone-100">
                {DATES.filter(({ key }) => (schedule[key] ?? []).length > 0).length === 0 ? (
                  <p className="text-sm text-stone-400 text-center py-16">Nessun elemento pianificato — vai in vista griglia e trascina o tocca le card</p>
                ) : (
                  DATES.map(({ key, day, dow }) => {
                    const keys = schedule[key] ?? []
                    if (keys.length === 0) return null
                    return (
                      <div key={key} className="flex gap-4 p-5">
                        <div className="shrink-0 w-14 text-center pt-0.5">
                          <p className="text-xs uppercase tracking-widest text-stone-400">{dow}</p>
                          <p className="font-serif text-3xl font-bold text-stone-900 leading-none">{day}</p>
                          <p className="text-xs text-stone-400">{MONTHS_IT[7]}</p>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col gap-4">
                          {keys.map((k, idx) => {
                            if (isActKey(k)) {
                              const a = activityById.current.get(actId(k))
                              if (!a) return null
                              return (
                                <div key={`${k}-${idx}`} className="group relative">
                                  {/* Mobile: image card */}
                                  <div className="sm:hidden">
                                    <div className="aspect-[4/3] relative overflow-hidden bg-stone-100 mb-3 rounded-lg">
                                      <Image src={a.imageUrl} alt={a.title} fill className="object-cover" sizes="100vw" />
                                    </div>
                                    <p className="font-serif text-lg font-bold text-stone-900">{a.title}</p>
                                    <p className="text-sm text-stone-400 line-clamp-2 mt-1">{a.descrizione}</p>
                                  </div>
                                  {/* Desktop: compact row */}
                                  <div className="hidden sm:flex items-center gap-3 rounded-lg border border-amber-100 px-4 py-3 hover:border-amber-300 transition-colors">
                                    <span className="shrink-0 w-2 h-2 rounded-full bg-amber-400" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-stone-800 truncate">{a.title}</p>
                                      <p className="text-xs text-stone-400 mt-0.5 capitalize">{a.categoria}</p>
                                    </div>
                                    <button onClick={() => removeFromDay(key, idx)} className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-stone-600 transition-opacity text-sm" aria-label="Rimuovi">×</button>
                                  </div>
                                  <button onClick={() => removeFromDay(key, idx)} className="sm:hidden absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center text-stone-400 hover:text-stone-700 text-sm shadow" aria-label="Rimuovi">×</button>
                                </div>
                              )
                            }
                            const h = hikeBySlug.current.get(k)
                            if (!h) return null
                            return (
                              <div key={`${k}-${idx}`} className="group relative">
                                <div className="sm:hidden">
                                  <Link href={h.href} className="block"><HikeCard hike={h} /></Link>
                                </div>
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
                                  <button onClick={() => removeFromDay(key, idx)} className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-stone-600 transition-opacity text-sm" aria-label="Rimuovi">×</button>
                                </div>
                                <button onClick={() => removeFromDay(key, idx)} className="sm:hidden absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center text-stone-400 hover:text-stone-700 text-sm shadow" aria-label="Rimuovi">×</button>
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

        {/* Palette */}
        {(availableHikes.length > 0 || availableAttivita.length > 0) && (
          <div className="border-t border-stone-100 pt-2">

            {/* Gite — sezioni per difficoltà */}
            {DIFFICULTIES.map((diff, idx) => {
              const hikesByDiff = availableHikes.filter(h => h.difficultyLevel === diff.level)
              if (hikesByDiff.length === 0) return null
              return (
                <section key={diff.level} className="border-t border-stone-100 py-16">
                  <div className="mb-10">
                    <motion.span
                      className="text-[10px] uppercase tracking-widest text-stone-300 tabular-nums block mb-4"
                      initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.45, ease }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </motion.span>
                    <motion.h2
                      className="font-serif font-bold leading-none"
                      style={{ color: diff.color, fontSize: 'clamp(3rem, 8vw, 6rem)' }}
                      initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, ease, delay: 0.1 }}
                    >
                      {diff.label}
                    </motion.h2>
                    <motion.div
                      className="h-px mt-5 origin-left" style={{ background: diff.color }}
                      initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
                      viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.9, ease, delay: 0.25 }}
                    />
                    <motion.p
                      className="text-xs uppercase tracking-widest text-stone-400 mt-3"
                      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                      viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.5 }}
                    >
                      {hikesByDiff.length} {hikesByDiff.length === 1 ? 'gita' : 'gite'} · trascina o tocca per selezionare
                    </motion.p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
                    <AnimatePresence>
                      {hikesByDiff.map(h => (
                        <PaletteCard key={h.slug} itemKey={h.slug}>
                          <HikeCard hike={h} />
                        </PaletteCard>
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )
            })}

            {/* Attività — sezioni per categoria */}
            {(['visite', 'cibo'] as const).map(cat => {
              const items = availableAttivita.filter(a => a.categoria === cat)
              if (items.length === 0) return null
              const label = cat === 'cibo' ? 'Cibo & Aperitivo' : 'Visite & Natura'
              return (
                <section key={cat} className="border-t border-stone-100 py-16">
                  <div className="mb-10">
                    <motion.h2
                      className="font-serif font-bold leading-none text-stone-900"
                      style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }}
                      initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, ease, delay: 0.1 }}
                    >
                      {label}
                    </motion.h2>
                    <motion.div
                      className="h-px mt-5 origin-left bg-amber-400"
                      initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
                      viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.9, ease, delay: 0.25 }}
                    />
                    <motion.p
                      className="text-xs uppercase tracking-widest text-stone-400 mt-3"
                      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                      viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.5 }}
                    >
                      {items.length} {items.length === 1 ? 'attività' : 'attività'} · trascina o tocca per selezionare
                    </motion.p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
                    <AnimatePresence>
                      {items.map(a => (
                        <PaletteCard key={actKey(a.id)} itemKey={actKey(a.id)}>
                          <div className="group">
                            <div className="aspect-[4/3] relative overflow-hidden bg-stone-100 mb-5 rounded-lg">
                              <Image src={a.imageUrl} alt={a.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                              <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/20 transition-colors duration-500" />
                            </div>
                            <div>
                              <h3 className="font-serif text-xl font-bold leading-tight text-stone-900 mb-2 group-hover:text-stone-500 transition-colors duration-300">{a.title}</h3>
                              <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed">{a.descrizione}</p>
                            </div>
                          </div>
                        </PaletteCard>
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )
            })}

          </div>
        )}

        {availableHikes.length === 0 && availableAttivita.length === 0 && (
          <p className="border-t border-stone-100 pt-12 text-sm text-stone-400">
            Tutte le gite e le attività sono nel calendario.
          </p>
        )}

      </div>
    </div>
  )
}
