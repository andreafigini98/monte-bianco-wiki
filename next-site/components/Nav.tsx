'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const links = [
  { href: '/', label: 'Gite' },
  { href: '/gite-komoot', label: 'Komoot' },
  { href: '/mappa', label: 'Mappa' },
  { href: '/calendario', label: 'Calendario' },
]

export default function Nav() {
  const pathname = usePathname()
  return (
    <motion.nav
      className="bg-white border-b border-stone-100 px-6 md:px-12 py-5 flex items-center"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href="/" className="font-serif text-xl font-bold text-stone-900 tracking-tight">
        Valle d&apos;Aosta
      </Link>
      <div className="flex items-center gap-8 ml-auto">
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className="relative text-xs uppercase tracking-widest group"
          >
            <span className={`transition-colors duration-200 ${
              pathname === l.href ? 'text-stone-900' : 'text-stone-400 group-hover:text-stone-900'
            }`}>
              {l.label}
            </span>
            {pathname === l.href && (
              <motion.span
                layoutId="nav-underline"
                className="absolute -bottom-1 left-0 right-0 h-px bg-stone-900"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
          </Link>
        ))}

        <Link
          href="/segreto"
          className="text-xl leading-none opacity-40 hover:opacity-100 transition-opacity"
          title="Area riservata"
        >
          🤫
        </Link>
      </div>
    </motion.nav>
  )
}
