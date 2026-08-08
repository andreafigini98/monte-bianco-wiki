'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { DifficultyLevel } from '@/lib/hikes'
import MapWrapper from '@/components/MapWrapper'

const ease = [0.22, 1, 0.36, 1] as const

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.6, ease, delay },
})

const DIFF_HEX: Record<DifficultyLevel, string> = {
  'facile': '#10b981',
  'media': '#eab308',
  'impegnativa': '#f97316',
  'molto impegnativa': '#ef4444',
}

type Stat = { label: string; value: string }

type Props = {
  slug: string
  title: string
  zona: string
  difficultyLevel: DifficultyLevel
  difficolta: string
  descrizione: string
  coordinate: string
  imageUrl: string
  stats: Stat[]
  contentHtml: string
  backHref?: string
  backLabel?: string
  extra?: React.ReactNode
  statsExtra?: React.ReactNode
  trailRoute?: [number, number][]
}

export default function HikePageContent({
  slug, title, zona, difficultyLevel, descrizione, coordinate, imageUrl, stats, contentHtml,
  backHref = '/', backLabel = 'Tutte le gite', extra, statsExtra, trailRoute,
}: Props) {
  const [lat, lng] = coordinate.split(',').map(Number)
  const hasMap = coordinate && !isNaN(lat) && !isNaN(lng)
  const diffColor = DIFF_HEX[difficultyLevel]

  return (
    <main>

      {/* ── 1. Hero full-width ── */}
      <motion.div
        className="relative h-[65vh] min-h-96 overflow-hidden bg-stone-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9 }}
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover opacity-60"
            sizes="100vw"
            priority
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/30 to-transparent" />

        {/* Back link */}
        <motion.div className="absolute top-6 left-6 md:left-12" {...fadeUp(0.1)}>
          <Link
            href={backHref}
            className="text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors"
          >
            ← {backLabel}
          </Link>
        </motion.div>

        {/* Title block — bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 md:px-12">
          <div className="max-w-3xl">
            <motion.div className="flex items-center gap-3 mb-3" {...fadeUp(0.18)}>
              <span className="text-xs uppercase tracking-widest text-white/50">{zona}</span>
              <span className="text-white/25">·</span>
              <span
                className="text-xs uppercase tracking-wide font-semibold"
                style={{ color: diffColor }}
              >
                {difficultyLevel}
              </span>
            </motion.div>

            <motion.h1
              className="font-serif text-4xl md:text-6xl font-bold leading-tight text-white mb-4"
              {...fadeUp(0.26)}
            >
              {title}
            </motion.h1>

            <motion.p
              className="text-white/60 text-base md:text-lg leading-relaxed max-w-2xl"
              {...fadeUp(0.34)}
            >
              {descrizione}
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* ── 4. Difficulty colored line ── */}
      <motion.div
        className="h-0.5 origin-left"
        style={{ background: diffColor }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, ease, delay: 0.45 }}
      />

      {/* ── Content ── */}
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-12 space-y-10">

        {/* ── 2. Stats card ── */}
        <motion.div
          className="bg-stone-50 rounded-xl p-6"
          {...fadeUp(0.38)}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {stats.map(({ label, value }) => (
              <div key={label} className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-widest text-stone-400">{label}</p>
                <p className="text-sm font-semibold text-stone-900 leading-snug">{value}</p>
              </div>
            ))}
            {statsExtra}
          </div>
        </motion.div>

        {/* Map */}
        {hasMap && (
          <motion.div
            className="h-72 overflow-hidden border border-stone-100 rounded-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.5 }}
          >
            <MapWrapper
              hikes={[{ slug, title, coordinate, difficultyLevel }]}
              zoom={13}
              center={[lat, lng]}
              trailRoute={trailRoute}
            />
          </motion.div>
        )}

        {/* Markdown body */}
        <motion.article
          className="prose prose-stone max-w-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.55 }}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {/* Extra content (e.g. waypoints) — bottom of page */}
        {extra}
      </div>
    </main>
  )
}
