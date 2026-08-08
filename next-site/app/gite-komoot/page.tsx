import { getAllKomootHikes } from '@/lib/komoot-hikes'
import HomeClient from '@/components/HomeClient'

export default function GiteKomoot() {
  const hikes = getAllKomootHikes()
  return <HomeClient hikes={hikes} />
}
