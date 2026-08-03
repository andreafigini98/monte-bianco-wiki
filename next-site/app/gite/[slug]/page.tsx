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

const DIFF_COLOR: Record<DifficultyLevel, string> = {
  'facile': 'text-emerald-600',
  'media': 'text-amber-600',
  'impegnativa': 'text-orange-600',
  'molto impegnativa': 'text-red-600',
}

export default async function HikePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const hike = getHikeBySlug(slug)
  if (!hike) notFound()

  const processed = await remark().use(remarkHtml, { sanitize: false }).process(hike.content)
  const contentHtml = processed.toString()

  const [lat, lng] = hike.coordinate.split(',').map(Number)

  return (
    <main className="max-w-3xl mx-auto px-6 md:px-12 py-12 space-y-10">
      <Link href="/" className="text-xs uppercase tracking-widest text-stone-400 hover:text-stone-700 transition-colors">
        ← Tutte le gite
      </Link>

      <div className="border-b border-stone-100 pb-10 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest text-stone-400">{hike.zona}</span>
          <span className="text-stone-200">·</span>
          <span className={`text-xs uppercase tracking-wide font-medium capitalize ${DIFF_COLOR[hike.difficultyLevel]}`}>
            {hike.difficultyLevel}
          </span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight text-stone-900">
          {hike.title}
        </h1>
        <p className="text-stone-500 text-lg leading-relaxed">{hike.descrizione}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {[
          { label: 'Difficoltà', value: hike.difficolta },
          { label: 'Dislivello', value: hike.dislivello },
          { label: 'Lunghezza', value: hike.lunghezza },
          { label: 'Tempo', value: hike.tempo },
          { label: 'Dal campeggio', value: hike.da_base },
        ].map(({ label, value }) => (
          <div key={label} className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-stone-400">{label}</p>
            <p className="text-sm font-medium text-stone-900">{value}</p>
          </div>
        ))}
      </div>

      {hike.coordinate && !isNaN(lat) && !isNaN(lng) && (
        <div className="h-72 overflow-hidden border border-stone-100">
          <MapWrapper
            hikes={[{ slug: hike.slug, title: hike.title, coordinate: hike.coordinate, difficultyLevel: hike.difficultyLevel }]}
            zoom={13}
            center={[lat, lng]}
          />
        </div>
      )}

      <article
        className="prose prose-stone max-w-none"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </main>
  )
}
