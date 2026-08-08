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
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease }}
    >
      <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-8">
        Punti di passaggio
      </p>

      <div className="flex flex-col">
        {points.map((wp, i) => (
          <div key={i} className="flex gap-5 items-stretch">

            {/* Left column: number centered on image + dashed line */}
            <div className="flex flex-col items-center w-6 flex-shrink-0">
              <div className="h-10 flex-shrink-0" />
              <span className="text-[11px] font-mono text-stone-400 leading-none flex-shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              {i < points.length - 1 && (
                <div
                  className="w-px flex-1 mt-2"
                  style={{ borderLeft: '1.5px dashed #e7e5e4' }}
                />
              )}
            </div>

            {/* Right: photo + name, animated on scroll */}
            <motion.div
              className={`flex gap-5 items-center -mx-2 px-2 py-1 rounded-xl hover:bg-stone-50 transition-colors cursor-default ${i < points.length - 1 ? 'pb-7' : ''}`}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, ease, delay: i * 0.07 }}
            >
              <div className="w-32 h-20 relative rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-stone-100">
                <Image
                  src={wp.image}
                  alt={wp.name}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
              <p className="text-sm text-stone-600 leading-snug">{wp.name}</p>
            </motion.div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
