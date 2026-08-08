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
      className="pt-10 border-t border-stone-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease, delay: 0.6 }}
    >
      <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-8">
        Punti di passaggio
      </p>

      <div className="flex flex-col">
        {points.map((wp, i) => (
          <div key={i} className="flex gap-5 items-stretch">

            {/* Left column: dot + dashed line */}
            <div className="flex flex-col items-center w-4 flex-shrink-0 pt-1">
              <div className="w-2 h-2 rounded-full bg-stone-300 flex-shrink-0" />
              {i < points.length - 1 && (
                <div
                  className="w-px flex-1 mt-2"
                  style={{ borderLeft: '1.5px dashed #d6d3d1', minHeight: '3rem' }}
                />
              )}
            </div>

            {/* Right: photo + name */}
            <div className={`flex gap-4 items-center ${i < points.length - 1 ? 'pb-7' : ''}`}>
              <div className="w-20 h-14 relative rounded-md overflow-hidden flex-shrink-0 ring-1 ring-stone-100">
                <Image
                  src={wp.image}
                  alt={wp.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <p className="text-sm text-stone-500 leading-snug">{wp.name}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
