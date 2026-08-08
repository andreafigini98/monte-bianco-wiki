import { notFound } from 'next/navigation'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'
import { getAllKomootHikes, getKomootHikeBySlug } from '@/lib/komoot-hikes'
import HikePageContent from '@/components/HikePageContent'
import WaypointTrail from '@/components/WaypointTrail'

export function generateStaticParams() {
  return getAllKomootHikes().map(h => ({ slug: h.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const hike = getKomootHikeBySlug(slug)
  if (!hike) return {}
  return { title: `${hike.title} — Monte Bianco Wiki` }
}

export default async function KomootHikePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const hike = getKomootHikeBySlug(slug)
  if (!hike) notFound()

  const processed = await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(hike.content)
  const contentHtml = processed.toString()

  return (
    <HikePageContent
      slug={hike.slug}
      title={hike.title}
      zona={hike.zona}
      difficultyLevel={hike.difficultyLevel}
      difficolta={hike.difficolta}
      descrizione={hike.descrizione}
      coordinate={hike.coordinate}
      imageUrl={hike.imageUrl}
      stats={[
        { label: 'Difficoltà', value: hike.difficolta },
        { label: 'Dislivello', value: hike.dislivello },
        { label: 'Lunghezza', value: hike.lunghezza },
        { label: 'Tempo', value: hike.tempo },
      ]}
      contentHtml={contentHtml}
      backHref="/gite-komoot"
      backLabel="Gite da Komoot"
      extra={<WaypointTrail waypoints={hike.waypoints ?? []} />}
    />
  )
}
