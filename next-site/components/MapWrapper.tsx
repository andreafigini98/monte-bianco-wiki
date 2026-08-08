'use client'
import dynamic from 'next/dynamic'
import type { MapHike } from './Map'

const Map = dynamic(() => import('./Map'), { ssr: false, loading: () => (
  <div className="h-full w-full bg-slate-200 animate-pulse rounded-lg" />
)})

type Props = { hikes: MapHike[]; zoom?: number; center?: [number, number]; trailRoute?: [number, number][] }
export default function MapWrapper(props: Props) {
  return <Map {...props} />
}
