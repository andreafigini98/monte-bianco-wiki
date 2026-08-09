'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Attivita, Categoria } from '@/lib/activities'

const ease = [0.22, 1, 0.36, 1] as const

const CATEGORIE: { key: Categoria; label: string; color: string }[] = [
  { key: 'visite', label: 'Visite & Natura', color: '#10b981' },
  { key: 'cibo',   label: 'Cibo & Aperitivo', color: '#f59e0b' },
]

function AttivitaCard({ attivita }: { attivita: Attivita }) {
  return (
    <div className="group block">
      <div className="aspect-[4/3] relative overflow-hidden bg-stone-100 mb-5 rounded-lg">
        <Image
          src={attivita.imageUrl}
          alt={attivita.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/20 transition-colors duration-500" />
      </div>
      <h3 className="font-serif text-xl font-bold leading-tight text-stone-900 mb-2 group-hover:text-stone-500 transition-colors duration-300">
        {attivita.title}
      </h3>
      <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed">{attivita.descrizione}</p>
    </div>
  )
}

function CategoriaSection({
  categoria,
  attivita,
  index,
}: {
  categoria: (typeof CATEGORIE)[number]
  attivita: Attivita[]
  index: number
}) {
  if (attivita.length === 0) return null
  return (
    <section className="border-t border-stone-100 py-20">
      <div className="mb-12">
        <div className="flex items-center justify-between mb-5">
          <motion.span
            className="text-[10px] uppercase tracking-widest text-stone-300 tabular-nums"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, ease }}
          >
            {String(index + 1).padStart(2, '0')}
          </motion.span>
        </div>

        <motion.h2
          className="font-serif font-bold leading-none"
          style={{ color: categoria.color, fontSize: 'clamp(3rem, 8vw, 6rem)' }}
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
        >
          {categoria.label}
        </motion.h2>

        <motion.div
          className="h-px mt-5 origin-left"
          style={{ background: categoria.color }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, ease, delay: 0.25 }}
        />

        <motion.p
          className="text-xs uppercase tracking-widest text-stone-400 mt-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          {attivita.length} {attivita.length === 1 ? 'attività' : 'attività'}
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
        {attivita.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, ease, delay: i * 0.08 }}
          >
            <AttivitaCard attivita={a} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default function AttivitaClient({ attivita }: { attivita: Attivita[] }) {
  return (
    <main className="max-w-7xl mx-auto px-6 md:px-12">
      <motion.div
        className="relative py-16 md:py-28 border-b border-stone-100 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease }}
      >
        <motion.span
          className="absolute right-0 top-1/2 -translate-y-1/2 font-serif font-bold text-[20vw] leading-none text-stone-50 select-none pointer-events-none"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease, delay: 0.2 }}
        >
          {attivita.length}
        </motion.span>

        <div className="relative space-y-5 max-w-3xl">
          <motion.p
            className="text-xs uppercase tracking-widest text-stone-400"
            initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, ease, delay: 0.1 }}
          >
            Valle d&apos;Aosta · Estate 2026
          </motion.p>

          <motion.h1
            className="font-serif text-6xl md:text-8xl font-bold leading-none text-stone-900"
            initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, ease, delay: 0.2 }}
          >
            {attivita.length} attività<br />
            <span className="text-stone-400">da vivere.</span>
          </motion.h1>

          <motion.div
            className="h-px bg-stone-200 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, ease, delay: 0.45 }}
          />

          <motion.p
            className="text-stone-500 text-lg max-w-xl leading-relaxed"
            initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, ease, delay: 0.35 }}
          >
            Terme, borghi, cucina e panorami — tutto quello che c&apos;è oltre le gite.
          </motion.p>
        </div>
      </motion.div>

      {CATEGORIE.map((cat, i) => (
        <CategoriaSection
          key={cat.key}
          categoria={cat}
          attivita={attivita.filter(a => a.categoria === cat.key)}
          index={i}
        />
      ))}
    </main>
  )
}
