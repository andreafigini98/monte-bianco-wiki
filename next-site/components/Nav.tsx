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
    <nav className="bg-white border-b border-stone-100 px-6 md:px-12 py-5 flex items-center">
      <Link href="/" className="font-serif text-xl font-bold text-stone-900 tracking-tight">
        Valle d&apos;Aosta
      </Link>
      <div className="flex gap-8 ml-auto">
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={`text-xs uppercase tracking-widest transition-colors ${
              pathname === l.href
                ? 'text-stone-900'
                : 'text-stone-400 hover:text-stone-900'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
