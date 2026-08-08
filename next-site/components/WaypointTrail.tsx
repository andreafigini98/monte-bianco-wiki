'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Waypoint } from '@/lib/hikes'

const ease = [0.22, 1, 0.36, 1] as const

export default function WaypointTrail({ waypoints }: { waypoints: Waypoint[] }) {
  const points = waypoints.filter(w => w.image)
  if (points.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease, delay: 0.6 }}
    >
      <h2 className="text-[10px] uppercase tracking-widest text-stone-400 mb-8">
        Punti di passaggio
      </h2>

      {/* ── Horizontal trail (desktop) / vertical trail (mobile) ── */}
      <div className="relative">

        {/* Desktop: horizontal scrollable */}
        <div className="hidden sm:flex items-start overflow-x-auto pb-4 gap-0">
          {points.map((wp, i) => (
            <div key={i} className="flex items-start flex-shrink-0">

              {/* Waypoint card */}
              <div className="flex flex-col items-center w-44">
                {/* Photo */}
                <div className="w-36 h-24 relative rounded-lg overflow-hidden mb-3 ring-1 ring-stone-100">
                  <Image
                    src={wp.image}
                    alt={wp.name}
                    fill
                    className="object-cover"
                    sizes="144px"
                  />
                </div>

                {/* Dot on the line */}
                <div className="w-2.5 h-2.5 rounded-full bg-stone-400 ring-2 ring-white mb-3 z-10" />

                {/* Name */}
                <p className="text-xs text-center text-stone-600 leading-snug px-1 max-w-[136px]">
                  {wp.name}
                </p>
              </div>

              {/* Connector line (between waypoints) */}
              {i < points.length - 1 && (
                <div className="flex-shrink-0 w-8 border-t-2 border-dashed border-stone-200 mt-[6.25rem]" />
              )}
            </div>
          ))}
        </div>

        {/* Mobile: vertical timeline */}
        <div className="sm:hidden flex flex-col">
          {points.map((wp, i) => (
            <div key={i} className="flex gap-4 items-start">

              {/* Left: dot + line */}
              <div className="flex flex-col items-center flex-shrink-0 w-5 pt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-stone-400 ring-2 ring-white flex-shrink-0" />
                {i < points.length - 1 && (
                  <div className="w-px flex-1 mt-2 mb-2 border-l-2 border-dashed border-stone-200 min-h-[3rem]" />
                )}
              </div>

              {/* Right: photo + name */}
              <div className={`flex gap-3 items-start ${i < points.length - 1 ? 'mb-4' : ''}`}>
                <div className="w-24 h-16 relative rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-stone-100">
                  <Image
                    src={wp.image}
                    alt={wp.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <p className="text-sm text-stone-600 leading-snug pt-1">{wp.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
