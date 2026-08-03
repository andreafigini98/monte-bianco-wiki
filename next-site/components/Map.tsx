'use client'
export type MapHike = {
  slug: string
  title: string
  coordinate: string
  difficultyLevel: string
}
type Props = { hikes: MapHike[]; zoom?: number; center?: [number, number] }
export default function Map({ hikes }: Props) {
  return (
    <div className="h-full w-full bg-slate-200 flex items-center justify-center text-slate-500 text-sm rounded-lg">
      Mappa (caricamento…)
    </div>
  )
}
