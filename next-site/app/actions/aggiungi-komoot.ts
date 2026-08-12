'use server'

export type KomootData = {
  tourId: string
  title: string
  difficulty: 'Facile' | 'Moderato' | 'Difficile'
  difficultyTag: 'facile' | 'moderato' | 'difficile'
  zoneTag: string
  dislivello: string
  lunghezza: string
  tempo: string
  coordinate: string
  route: string
  imageUrl: string
  descrizione: string
  waypoints: { name: string; image: string }[]
  filename: string
}

export type FetchResult =
  | { ok: true; data: KomootData }
  | { ok: false; error: string }

export type PublishResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

// ── helpers ──────────────────────────────────────────────────────────────────

function unescape(s: string): string {
  const SENTINEL = '\x00'
  return s
    .replaceAll('\\\\"', SENTINEL)
    .replaceAll('\\"', '"')
    .replaceAll(SENTINEL, '\\"')
}

function parseDifficulty(grade: string): { display: 'Facile' | 'Moderato' | 'Difficile'; tag: 'facile' | 'moderato' | 'difficile' } {
  const g = grade.toLowerCase()
  if (g === 'hard' || g === 'difficult' || g === 'expert') return { display: 'Difficile', tag: 'difficile' }
  if (g === 'easy') return { display: 'Facile', tag: 'facile' }
  return { display: 'Moderato', tag: 'moderato' }
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h${String(m).padStart(2, '0')}`
}

function inferZone(lat: number, lon: number): string {
  if (lat > 45.78 && lon > 7.55) return 'cervino'
  if (lat > 45.75 && lon < 6.95) return 'la-thuile'
  if (lat > 45.75 && lon < 7.10) return 'val-ferret'
  if (lat > 45.70 && lon < 7.20) return 'monte-bianco'
  if (lat > 45.70 && lon < 7.30) return 'courmayeur'
  if (lat > 45.55 && lon > 7.30 && lon < 7.45) return 'cogne'
  if (lon > 7.55) return 'cervino'
  return 'gran-paradiso'
}

function generateMarkdown(d: KomootData): string {
  const komootUrl = `https://www.komoot.com/it-it/tour/${d.tourId}`
  const waypointsYaml = d.waypoints.length
    ? '\n\nwaypoints:\n' + d.waypoints.map(w => `  - name: "${w.name}"\n    image: "${w.image}"`).join('\n')
    : ''
  const heroImage = d.imageUrl
    ? `\n![${d.title}](${d.imageUrl})\n*Foto: [Komoot](${komootUrl})*\n`
    : ''
  const coordGmaps = d.coordinate.replace(', ', ',')

  return `---
tags: [gita, komoot, ${d.difficultyTag}, ${d.zoneTag}]
dislivello: "${d.dislivello}"
lunghezza: "${d.lunghezza}"
tempo: "${d.tempo}"
difficolta: "${d.difficulty}"
coordinate: "${d.coordinate}"
komoot: "${komootUrl}"
route: "${d.route}"
imageUrl: "${d.imageUrl}"
descrizione: "${d.descrizione}"${waypointsYaml}
---

# ${d.title}
${heroImage}

## Dati tecnici

| | |
|---|---|
| **Difficoltà** | ${d.difficulty} |
| **Dislivello positivo** | ${d.dislivello} |
| **Lunghezza** | ${d.lunghezza} |
| **Tempo di percorrenza** | ${d.tempo} |
| **Coordinate partenza** | \`${d.coordinate}\` ([mappa](https://www.google.com/maps?q=${coordGmaps})) |
| **Komoot** | [Apri su Komoot](${komootUrl}) |
`
}

// ── server actions ────────────────────────────────────────────────────────────

export async function fetchKomootTour(url: string): Promise<FetchResult> {
  try {
    const tourIdMatch = url.match(/\/tour\/(\d+)/)
    if (!tourIdMatch) return { ok: false, error: 'URL Komoot non valido (deve contenere /tour/ID)' }
    const tourId = tourIdMatch[1]

    const res = await fetch(`https://www.komoot.com/it-it/tour/${tourId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      cache: 'no-store',
    })
    if (!res.ok) return { ok: false, error: `Komoot ha risposto con errore ${res.status}` }
    const html = await res.text()

    // Find the big script (tour data JSON)
    const scriptMatches = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)]
    const bigScript = scriptMatches.find(m => m[1].length > 50_000)?.[1] ?? ''
    if (!bigScript) return { ok: false, error: 'Dati del tour non trovati nella pagina' }

    const u = unescape(bigScript)

    // Title
    const title = (html.match(/<title>([^|<]+)/)?.[1] ?? '').trim()
    if (!title) return { ok: false, error: 'Titolo non trovato' }

    // Cover image
    let imageUrl = ''
    const coverSection = u.match(/"cover_images":\{"_embedded":\{"items":\[([\s\S]+?)\]/)
    if (coverSection) {
      const src = coverSection[1].match(/"src":"(https:\/\/d2exd72xrrp1s7\.cloudfront\.net\/[^"]+)"/)
      if (src && !src[1].includes('defaultuserimage')) {
        imageUrl = src[1].replace(/\?[^"]*/, '?width=768&height=576&crop=true')
      }
    }

    // Waypoints from timeline highlights
    const waypoints: { name: string; image: string }[] = []
    const tlStart = u.indexOf('"timeline":{"_embedded":{"items":[')
    if (tlStart >= 0) {
      const itemsAnchor = u.indexOf('"items"', tlStart)
      const itemsStart = u.indexOf('[', itemsAnchor) + 1
      let depth = 1, i = itemsStart
      while (i < u.length && depth > 0) {
        if (u[i] === '[') depth++
        else if (u[i] === ']') depth--
        i++
      }
      const itemsContent = u.slice(itemsStart, i - 1)

      let searchFrom = 0
      while (true) {
        const typeIdx = itemsContent.indexOf('"type":"highlight"', searchFrom)
        if (typeIdx < 0) break

        const blockStart = itemsContent.lastIndexOf('{"index":', typeIdx)
        if (blockStart < 0) { searchFrom = typeIdx + 1; continue }

        let d2 = 0, j = blockStart
        while (j < itemsContent.length) {
          if (itemsContent[j] === '{') d2++
          else if (itemsContent[j] === '}') { d2--; if (d2 === 0) break }
          j++
        }
        const block = itemsContent.slice(blockStart, j + 1)

        const names = [...block.matchAll(/"name":"([^"]+)"/g)].map(m => m[1])
        const imgs = [...block.matchAll(/"src":"(https:\/\/d2exd72xrrp1s7\.cloudfront\.net\/[^"]+)"/g)]
          .map(m => m[1])
          .filter(img => !img.includes('defaultuserimage') && img.includes('uhi'))

        if (names.length && imgs.length) {
          const img = imgs[0].replace(/\?[^"]*/, '?width=512&height=384&crop=true')
          if (!waypoints.find(w => w.image === img)) {
            waypoints.push({ name: names[0], image: img })
          }
        }
        searchFrom = typeIdx + 1
      }
    }

    // Coordinates + route
    let coordinate = ''
    let route = ''
    let lat0 = 0, lon0 = 0
    const coordSection = u.match(/"coordinates":\{"items":\[([\s\S]+?)\]\}/)
    if (coordSection) {
      const points = [...coordSection[1].matchAll(/"lat":([\d.]+),"lng":([\d.]+)/g)]
      if (points.length) {
        lat0 = parseFloat(points[0][1])
        lon0 = parseFloat(points[0][2])
        coordinate = `${lat0.toFixed(4)}, ${lon0.toFixed(4)}`
        const sampled = points.filter((_, i) => i % 8 === 0)
        route = JSON.stringify(sampled.map(p => [+parseFloat(p[1]).toFixed(5), +parseFloat(p[2]).toFixed(5)]))
      }
    }

    // Stats: look near "status":"public" which starts the main tour object
    const statusIdx = u.indexOf('"status":"public"')
    const tourChunk = statusIdx >= 0 ? u.slice(statusIdx, statusIdx + 8000) : u
    const distanceM = parseInt(tourChunk.match(/"distance":(\d+)/)?.[1] ?? '0')
    const elevationM = parseInt(tourChunk.match(/"elevation_up":(\d+)/)?.[1] ?? '0')
    const durationS = parseInt(tourChunk.match(/"duration":(\d+)/)?.[1] ?? '0')
    const gradeRaw = tourChunk.match(/"grade":"([^"]+)"/)?.[1] ?? ''

    const { display: difficulty, tag: difficultyTag } = parseDifficulty(gradeRaw)
    const distKm = distanceM / 1000
    const lunghezza = `${distKm.toFixed(1).replace('.', ',')} km`
    const dislivello = `${elevationM} m`
    const tempo = formatDuration(durationS)
    const zoneTag = inferZone(lat0, lon0)
    const descrizione = `${title}: ${lunghezza}, ${dislivello} di dislivello, ${difficulty.toLowerCase()}.`

    // Filename: title slug, deduped with tourId if needed
    const filename = title

    const data: KomootData = {
      tourId, title, difficulty, difficultyTag, zoneTag,
      dislivello, lunghezza, tempo, coordinate, route,
      imageUrl, descrizione, waypoints, filename,
    }

    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Errore sconosciuto' }
  }
}

export async function publishKomootTour(data: KomootData): Promise<PublishResult> {
  const token = process.env.GITHUB_TOKEN
  if (!token) return { ok: false, error: 'GITHUB_TOKEN non configurato nel server' }

  const owner = 'andreafigini98'
  const repo = 'monte-bianco-wiki'
  const filePath = `content-monte-bianco/Gite da Komoot/${data.filename}.md`
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`

  // Check if file already exists (to get sha for update)
  const checkRes = await fetch(apiUrl, {
    headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github+json' },
  })

  let sha: string | undefined
  if (checkRes.ok) {
    const existing = await checkRes.json() as { sha?: string }
    sha = existing.sha
    // Use tourId to disambiguate
    const newFilename = `${data.filename} (${data.tourId})`
    data = { ...data, filename: newFilename }
    return publishKomootTour(data) // retry with new filename
  }

  const content = generateMarkdown(data)
  const body: Record<string, string> = {
    message: `feat: aggiungi ${data.filename} via admin`,
    content: Buffer.from(content).toString('base64'),
  }
  if (sha) body.sha = sha

  const res = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json() as { message?: string }
    return { ok: false, error: `GitHub: ${err.message ?? res.status}` }
  }

  const result = await res.json() as { content?: { html_url?: string } }
  return { ok: true, url: result.content?.html_url ?? `https://github.com/${owner}/${repo}` }
}

const GH_DIR = 'content-monte-bianco/Gite da Komoot'
const GH_HEADERS = (token: string) => ({
  Authorization: `token ${token}`,
  Accept: 'application/vnd.github+json',
})

export async function listKomootTours(): Promise<{ ok: true; files: { name: string; sha: string }[] } | { ok: false; error: string }> {
  const token = process.env.GITHUB_TOKEN
  if (!token) return { ok: false, error: 'GITHUB_TOKEN non configurato' }

  const res = await fetch(
    `https://api.github.com/repos/andreafigini98/monte-bianco-wiki/contents/${encodeURIComponent(GH_DIR)}`,
    { headers: GH_HEADERS(token), cache: 'no-store' },
  )
  if (!res.ok) return { ok: false, error: `GitHub: ${res.status}` }

  const items = await res.json() as { name: string; sha: string; type: string }[]
  const files = items
    .filter(f => f.type === 'file' && f.name.endsWith('.md'))
    .map(f => ({ name: f.name.replace(/\.md$/, ''), sha: f.sha }))
    .sort((a, b) => a.name.localeCompare(b.name, 'it'))

  return { ok: true, files }
}

export async function deleteKomootTour(filename: string, sha: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = process.env.GITHUB_TOKEN
  if (!token) return { ok: false, error: 'GITHUB_TOKEN non configurato' }

  const filePath = `${GH_DIR}/${filename}.md`
  const res = await fetch(
    `https://api.github.com/repos/andreafigini98/monte-bianco-wiki/contents/${encodeURIComponent(filePath)}`,
    {
      method: 'DELETE',
      headers: { ...GH_HEADERS(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `chore: elimina ${filename} via admin`, sha }),
    },
  )

  if (!res.ok) {
    const err = await res.json() as { message?: string }
    return { ok: false, error: `GitHub: ${err.message ?? res.status}` }
  }
  return { ok: true }
}
