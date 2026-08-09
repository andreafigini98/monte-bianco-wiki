import { getAllHikes } from '@/lib/hikes'
import HomeClient from '@/components/HomeClient'

export default function GitePage() {
  const hikes = getAllHikes()
  return <HomeClient hikes={hikes} />
}
