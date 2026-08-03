import { notFound } from 'next/navigation'
import Link from 'next/link'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import { getAllHikes, getHikeBySlug } from '@/lib/hikes'
import type { DifficultyLevel } from '@/lib/hikes'
import MapWrapper from '@/components/MapWrapper'

export function generateStaticParams() {
  return getAllHikes().map(h => ({ slug: h.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const hike = getHikeBySlug(slug)
  if (!hike) return {}
  return { title: `${hike.title} — Monte Bianco Wiki`, description: hike.descrizione }
}

const BADGE: Record<DifficultyLevel, string> = {
  'facile': 'bg-emerald-100 text-emerald-800',
  'media': 'bg-yellow-100 text-yellow-800',
  'impegnativa': 'bg-orange-100 text-orange-800',
  'molto impegnativa': 'bg-red-100 text-red-800',
}

export default async function HikePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const hike = getHikeBySlug(slug)
  if (!hike) notFound()

  const processed = await remark().use(remarkHtml, { sanitize: false }).process(hike.content)
  const contentHtml = processed.toString()

  const [lat, lng] = hike.coordinate.split(',').map(Number)

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">← Tutte le gite</Link>

      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold text-slate-900">{hike.title}</h1>
          <span className={`text-sm font-medium px-3 py-1 rounded-full capitalize ${BADGE[hike.difficultyLevel]}`}>
            {hike.difficultyLevel}
          </span>
        </div>
        <p className="text-slate-500">{hike.descrizione}</p>
      </div>

      <table className="w-full text-sm border-collapse">
        <tbody>
          {[
            ['Difficoltà', hike.difficolta],
            ['Dislivello', hike.dislivello],
            ['Lunghezza', hike.lunghezza],
            ['Tempo', hike.tempo],
            ['Dal campeggio', hike.da_base],
          ].map(([label, value]) => (
            <tr key={label} className="border-b border-slate-100">
              <td className="py-2 pr-4 font-medium text-slate-600 w-36">{label}</td>
              <td className="py-2 text-slate-900">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {hike.coordinate && !isNaN(lat) && !isNaN(lng) && (
        <div className="h-64 rounded-xl overflow-hidden border border-slate-200">
          <MapWrapper
            hikes={[{ slug: hike.slug, title: hike.title, coordinate: hike.coordinate, difficultyLevel: hike.difficultyLevel }]}
            zoom={13}
            center={[lat, lng]}
          />
        </div>
      )}

      <article
        className="prose prose-slate max-w-none"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </main>
  )
}
