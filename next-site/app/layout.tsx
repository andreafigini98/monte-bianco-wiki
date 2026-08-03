import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Nav from '@/components/Nav'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'Monte Bianco Wiki',
  description: "Gite in Valle d'Aosta — base Camping Monte Bianco, Sarre",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={geist.variable}>
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
        <Nav />
        <div className="flex-1">{children}</div>
        <footer className="bg-slate-800 text-slate-400 text-center text-xs py-4">
          Dati da fonti pubbliche — verifica sempre condizioni e meteo prima di partire.
        </footer>
      </body>
    </html>
  )
}
