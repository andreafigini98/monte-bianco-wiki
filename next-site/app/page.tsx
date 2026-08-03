import { getAllHikes } from '@/lib/hikes'
import HomeClient from '@/components/HomeClient'

export default function Home() {
  const hikes = getAllHikes()
  return <HomeClient hikes={hikes} />
}
