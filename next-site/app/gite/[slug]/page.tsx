import { notFound } from 'next/navigation'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'
import { getAllHikes, getHikeBySlug } from '@/lib/hikes'
import HikePageContent from '@/components/HikePageContent'

export function generateStaticParams() {
  return getAllHikes().map(h => ({ slug: h.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const hike = getHikeBySlug(slug)
  if (!hike) return {}
  return { title: `${hike.title} — Monte Bianco Wiki`, description: hike.descrizione }
}

export default async function HikePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const hike = getHikeBySlug(slug)
  if (!hike) notFound()

  const processed = await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(hike.content)

  return (
    <HikePageContent
      slug={hike.slug}
      title={hike.title}
      zona={hike.zona}
      difficultyLevel={hike.difficultyLevel}
      difficolta={hike.difficolta}
      descrizione={hike.descrizione}
      coordinate={hike.coordinate}
      stats={[
        { label: 'Difficoltà', value: hike.difficolta },
        { label: 'Dislivello', value: hike.dislivello },
        { label: 'Lunghezza', value: hike.lunghezza },
        { label: 'Tempo', value: hike.tempo },
        { label: 'Dal campeggio', value: hike.da_base },
      ]}
      contentHtml={processed.toString()}
    />
  )
}
