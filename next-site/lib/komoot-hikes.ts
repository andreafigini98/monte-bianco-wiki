import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { toSlug, ZONE_TAG_MAP } from './hikes'
import type { Hike, DifficultyLevel, Zona } from './hikes'

const KOMOOT_DIR = path.join(process.cwd(), '..', 'content-monte-bianco', 'Gite da Komoot')

function parseDifficulty(raw: string): DifficultyLevel {
  const s = raw.toLowerCase()
  if (s === 'difficile') return 'impegnativa'
  if (s === 'moderato') return 'media'
  if (s === 'facile') return 'facile'
  return 'media'
}

function parseZona(tags: string[]): Zona {
  for (const tag of tags) {
    if (ZONE_TAG_MAP[tag]) return ZONE_TAG_MAP[tag]
  }
  return 'Altro'
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  return match?.[1]?.trim() ?? ''
}

let _cache: Hike[] | null = null

export function getAllKomootHikes(): Hike[] {
  if (_cache) return _cache

  const files = fs.readdirSync(KOMOOT_DIR).filter(f => f.endsWith('.md') && f !== 'index.md')
  _cache = files.map(filename => {
    const raw = fs.readFileSync(path.join(KOMOOT_DIR, filename), 'utf-8')
    const { data, content } = matter(raw)
    const slug = toSlug(filename)

    return {
      slug,
      href: `/gite-komoot/${slug}`,
      title: extractTitle(content),
      difficolta: data.difficolta ?? '',
      difficultyLevel: parseDifficulty(data.difficolta ?? ''),
      dislivello: data.dislivello ?? '',
      lunghezza: data.lunghezza ?? '',
      tempo: data.tempo ?? '',
      da_base: data.da_base ?? '',
      coordinate: data.coordinate ?? '',
      descrizione: data.descrizione ?? '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      zona: parseZona(Array.isArray(data.tags) ? data.tags : []),
      imageUrl: '',
      content,
    }
  })
  return _cache
}

export function getKomootHikeBySlug(slug: string): Hike | undefined {
  return getAllKomootHikes().find(h => h.slug === slug)
}
