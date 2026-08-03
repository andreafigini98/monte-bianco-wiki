'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Gite' },
  { href: '/mappa', label: 'Mappa' },
]

export default function Nav() {
  const pathname = usePathname()
  return (
    <nav className="bg-slate-800 text-white px-6 py-3 flex items-center gap-6">
      <Link href="/" className="font-bold text-lg tracking-tight text-emerald-400">
        🏔️ Monte Bianco
      </Link>
      <div className="flex gap-4 ml-auto">
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={`text-sm font-medium transition-colors hover:text-emerald-400 ${
              pathname === l.href ? 'text-emerald-400' : 'text-slate-300'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
