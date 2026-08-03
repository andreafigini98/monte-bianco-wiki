import { describe, it, expect } from 'vitest'
import { toSlug, getAllHikes, getHikeBySlug } from './hikes'

describe('toSlug', () => {
  it('converts filename to URL-safe slug', () => {
    expect(toSlug('Rifugio Vittorio Sella e Valnontey.md')).toBe('rifugio-vittorio-sella-e-valnontey')
  })
  it('handles accented characters', () => {
    expect(toSlug("Lago d'Arpy e Testa d'Arpy.md")).toBe('lago-d-arpy-e-testa-d-arpy')
  })
  it('handles dashes in filename', () => {
    expect(toSlug('Rifugio Oriondè - Duca degli Abruzzi.md')).toBe('rifugio-orionde-duca-degli-abruzzi')
  })
})

describe('getAllHikes', () => {
  it('returns 21 hikes', () => {
    const hikes = getAllHikes()
    expect(hikes).toHaveLength(21)
  })

  it('every hike has required fields', () => {
    for (const h of getAllHikes()) {
      expect(h.slug).toBeTruthy()
      expect(h.title).toBeTruthy()
      expect(h.coordinate).toMatch(/^\d+\.\d+,\s*\d+\.\d+$/)
      expect(h.zona).not.toBe(undefined)
      expect(h.difficultyLevel).toMatch(/^(facile|media|impegnativa|molto impegnativa)$/)
      expect(h.imageUrl).toMatch(/^https:\/\/commons\.wikimedia\.org/)
    }
  })

  it('slugs are unique', () => {
    const slugs = getAllHikes().map(h => h.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})

describe('getHikeBySlug', () => {
  it('finds an existing hike', () => {
    const h = getHikeBySlug('rifugio-vittorio-sella-e-valnontey')
    expect(h?.title).toBe('Rifugio Vittorio Sella e Valnontey')
  })

  it('returns undefined for unknown slug', () => {
    expect(getHikeBySlug('non-esiste')).toBeUndefined()
  })
})
