import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export type DifficultyLevel = 'facile' | 'media' | 'impegnativa' | 'molto impegnativa'
export type Zona = 'Gran Paradiso' | 'Monte Bianco' | 'Cervino' | 'Monte Rosa' | 'Valpelline' | 'Altro'

export type Hike = {
  slug: string
  title: string
  difficolta: string
  difficultyLevel: DifficultyLevel
  dislivello: string
  lunghezza: string
  tempo: string
  da_base: string
  coordinate: string
  descrizione: string
  tags: string[]
  zona: Zona
  imageUrl: string
  content: string
}

const GITE_DIR = path.join(process.cwd(), '..', 'content-monte-bianco', 'Gite')

export function toSlug(filename: string): string {
  return filename
    .replace(/\.md$/, '')
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseDifficulty(raw: string): DifficultyLevel {
  const s = raw.toLowerCase()
  if (s.includes('molto impegnativa')) return 'molto impegnativa'
  if (s.includes('impegnativa')) return 'impegnativa'
  if (s.includes('media')) return 'media'
  return 'facile'
}

const ZONE_TAG_MAP: Record<string, Zona> = {
  'gran-paradiso': 'Gran Paradiso',
  'monte-bianco': 'Monte Bianco',
  'cervino': 'Cervino',
  'monte-rosa': 'Monte Rosa',
  'valpelline': 'Valpelline',
}

function parseZona(tags: string[]): Zona {
  for (const tag of tags) {
    if (ZONE_TAG_MAP[tag]) return ZONE_TAG_MAP[tag]
  }
  return 'Altro'
}

function extractImageUrl(content: string): string {
  const match = content.match(/!\[.*?\]\((https:\/\/commons\.wikimedia\.org\/[^\s)]+)\)/)
  return match?.[1] ?? ''
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  return match?.[1]?.trim() ?? ''
}

// ponytail: module-level cache, correct for SSG (single build process); drop if switching to ISR/dynamic routes
let _cache: Hike[] | null = null

export function getAllHikes(): Hike[] {
  if (_cache) return _cache

  const files = fs.readdirSync(GITE_DIR).filter(f => f.endsWith('.md'))
  _cache = files.map(filename => {
    const raw = fs.readFileSync(path.join(GITE_DIR, filename), 'utf-8')
    const { data, content } = matter(raw)

    return {
      slug: toSlug(filename),
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
      imageUrl: extractImageUrl(content),
      content,
    }
  })
  return _cache
}

export function getHikeBySlug(slug: string): Hike | undefined {
  return getAllHikes().find(h => h.slug === slug)
}
