import type { Metadata } from 'next'
import { Geist, Playfair_Display } from 'next/font/google'
import Nav from '@/components/Nav'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Monte Bianco Wiki',
  description: "Gite in Valle d'Aosta — base Camping Monte Bianco, Sarre",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${geist.variable} ${playfair.variable}`}>
      <body className="bg-white text-stone-900 min-h-screen flex flex-col">
        <Nav />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-stone-100 text-stone-400 text-center text-xs py-8 tracking-wide">
          Dati da fonti pubbliche — verifica sempre condizioni e meteo prima di partire.
        </footer>
      </body>
    </html>
  )
}
