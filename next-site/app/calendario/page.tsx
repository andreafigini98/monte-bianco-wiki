import { getAllKomootHikes } from '@/lib/komoot-hikes'
import { getSchedule } from '@/lib/calendario'
import { ATTIVITA } from '@/lib/activities'
import CalendarioClient from '@/components/CalendarioClient'

export const metadata = { title: 'Calendario agosto 2026' }

export default async function CalendarioPage() {
  const [hikes, schedule] = await Promise.all([
    getAllKomootHikes(),
    getSchedule(),
  ])
  return <CalendarioClient hikes={hikes} attivita={ATTIVITA} initialSchedule={schedule} />
}
