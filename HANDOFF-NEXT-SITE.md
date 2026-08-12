# Handoff — Sito Next.js (monte-bianco-next)

Ultimo aggiornamento: 2026-08-12. Scritto per un agente che riprende questo progetto senza contesto pregresso.

## Cos'è questo sito

Sito web statico generato con **Next.js 15 App Router**, pubblicato su **Vercel**, che legge i contenuti della
wiki escursionistica direttamente da `content-monte-bianco/Gite/*.md` — senza duplicazione, senza sync manuale.

Il sito è separato dalla pubblicazione Quartz (GitHub Pages): URL diverso, progetto Vercel indipendente.

- **Repo GitHub**: https://github.com/andreafigini98/monte-bianco-wiki (cartella `next-site/`)
- **Root su Vercel**: `next-site` — impostato via **Vercel UI** (Project Settings → General → Root Directory),
  NON in `vercel.json` (il campo `rootDirectory` in JSON non è supportato da Vercel).
- **`vercel.json`** alla root del repo contiene solo `{ "framework": "nextjs" }`.

## Struttura del progetto

```
next-site/
├── app/
│   ├── globals.css          Tailwind v3 directives + override stile popup Leaflet
│   ├── layout.tsx           Font (Geist + Playfair Display), Nav, footer, bg-white text-stone-900
│   ├── page.tsx             Homepage (server component) → chiama getAllHikes() → passa a HomeClient
│   ├── gite/[slug]/
│   │   └── page.tsx         Pagina gita (server) → remark markdown → HikePageContent
│   └── mappa/
│       └── page.tsx         Pagina mappa a schermo intero (calc(100vh - 56px)) con legenda
├── components/
│   ├── Nav.tsx              Navbar con wordmark serif, animazione entrata, underline attivo layoutId
│   ├── HomeClient.tsx       Homepage client: 4 sezioni per difficoltà, animazioni whileInView
│   ├── HikeCard.tsx         Card editoriale, aspect-[4/3] rounded-lg, overlay hover, serif title
│   ├── HikePageContent.tsx  Pagina gita client: hero full-width, stats card, linea colorata
│   ├── Map.tsx              Leaflet map (NO SSR): marker colorati, polyline OSRM, FitBounds, popup
│   └── MapWrapper.tsx       'use client' + dynamic import con ssr:false (obbligatorio in Next.js 15)
└── lib/
    ├── hikes.ts             Data layer: tipi, getAllHikes(), getHikeBySlug(), toSlug()
    └── hikes.test.ts        8 test Vitest sul data layer
```

## Design system

- **Font**: Playfair Display (serif, titoli) + Geist (sans, corpo) — caricati da `next/font/google`
- **Palette**: stone (900/500/400/200/100/50) su sfondo bianco
- **Colori difficoltà**: `#10b981` emerald (facile) · `#eab308` amber (media) · `#f97316` orange (impegnativa) · `#ef4444` red (molto impegnativa)
- **Tailwind**: v3 (NON v4 — incompatibile con Node 18). Config: `tailwind.config.ts` con
  `require('@tailwindcss/typography')` e font family estesi.
- **Animazioni**: framer-motion — blur+slide dal basso per hero e card, `whileInView` per le sezioni
  della homepage e le card nelle sezioni, `layoutId` per nav underline.

## Homepage (`components/HomeClient.tsx`)

La homepage è divisa in due parti:

**1. Hero** — identico a prima: titolo serif grande, numero decorativo in background, linea animata.

**2. Quattro sezioni per difficoltà** — `DIFFICULTIES` array definisce ordine e colore. Per ogni sezione:
- Numero sezione (`01`…`04`) in alto a sinistra
- Titolo difficoltà in serif grande nel colore della difficoltà, con blur+slide `whileInView`
- Linea colorata animata `scaleX` sotto il titolo
- Contatore gite
- Griglia card `1→2→3 colonne` con stagger `whileInView`

Non esiste più un filter bar — la navigazione per difficoltà è strutturale, non a filtro.

## Card (`components/HikeCard.tsx`)

- `aspect-[4/3]`, `rounded-lg`, overlay scuro al hover
- Titolo serif (`font-serif`)
- Stats pulite: `dislivello ↑ · tempo · da_base in auto` — niente emoji
- Nessun numero indice, nessuna freccia

## Pagine gita (`components/HikePageContent.tsx`)

Struttura in due blocchi separati:

**Hero full-width** (fuori dal container `max-w-3xl`):
- Immagine `fill` con `opacity-60` su sfondo `stone-900`
- Gradiente `from-stone-900 via-stone-900/30 to-transparent`
- Link "← Tutte le gite" in alto a sinistra sull'overlay
- Zona · difficoltà (colore) + titolo serif + descrizione sovrapposti in basso

**Linea colorata** (`h-0.5`, colore dalla difficoltà, `scaleX` animata) separa hero e contenuto.

**Contenuto** (`max-w-3xl mx-auto`):
- Stats card: `bg-stone-50 rounded-xl p-6`, griglia `2→3→5 colonne`
- Mappa `h-72 rounded-lg`
- Corpo markdown (`prose prose-stone`)

## Rendering markdown (`app/gite/[slug]/page.tsx`)

```ts
const processed = await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(hike.content)
const contentHtml = processed.toString().replace(/<p>\s*(?:<a[^>]*>)?\s*<img[^>]*>\s*(?:<\/a>)?\s*<\/p>/gi, '')
```

- `remark-gfm` obbligatorio per le tabelle markdown.
- La regex rimuove l'immagine dal corpo (già usata come hero). Le immagini nel markdown sono link
  cliccabili `[![alt](url)](link)`, quindi remark genera `<p><a href="..."><img ...></a></p>` —
  la regex cattura sia `<p><img>` semplice sia `<p><a><img></a></p>`.

## Mappa (`components/Map.tsx`)

- **Campeggio**: `CAMP = { lat: 45.7168, lng: 7.2619 }` — Camping Monte Bianco, Sarre (AO)
- **FitBounds**: componente figlio che usa `useMap()` per chiamare `map.fitBounds()` e centrare la
  vista sull'intero percorso. Si attiva solo quando `hikes.length === 1` (pagina singola gita).
  `boundsPoints`: usa la rotta OSRM se disponibile, altrimenti `[CAMP, gita]`.
- **Rotta OSRM**: `https://router.project-osrm.org/route/v1/driving/...` — converte da `[lng, lat]`
  a `[lat, lng]` per Leaflet. Auto-carica per gita singola; si carica al click sul marker in mappa globale.
- **Google Maps deep link**: `https://www.google.com/maps/dir/?api=1&origin=CAMP&destination=GITA&travelmode=driving`
- **Stile popup**: inline styles dentro il JSX del Popup (Leaflet monta fuori dall'albero React).
  Override globali del wrapper in `globals.css`.

**ATTENZIONE**: `MapWrapper` deve avere `'use client'` — Next.js 15 vieta `ssr: false` nei server component.

## Pattern server/client

Ogni pagina con dati dal filesystem:
1. **Server component** (`page.tsx`): chiama `getAllHikes()` o `getHikeBySlug()`, passa dati come props
2. **Client component** (`HomeClient.tsx`, `HikePageContent.tsx`): riceve i dati, gestisce animazioni

## Gotcha già risolti

| Problema | Soluzione |
|----------|-----------|
| Tailwind v4 incompatibile con Node 18 | Usa v3 con `tailwind.config.ts` e `@tailwind` directives |
| `params` in Next.js 15 | Deve essere `Promise<{ slug: string }>` e awaited |
| `MapWrapper` senza `'use client'` | Next.js 15 rifiuta `ssr: false` nei server component |
| Colore link nel popup Leaflet | `.leaflet-popup-content a[style] { color: inherit !important; }` in globals.css |
| Tabelle markdown come pipe grezze | `remark-gfm` obbligatorio nel chain remark |
| `rootDirectory` in `vercel.json` | Rimosso — impostare Root Directory via Vercel UI |
| Coordinate stringa vuota (`''`) | Guard `hike.coordinate && !isNaN(lat)` prima del render |
| `getAllHikes()` nel client component | Spostare la chiamata nel server component, passare i dati come props |
| Immagine ancora visibile nel corpo markdown | Le immagini sono link `[![](url)](link)` → remark genera `<p><a><img></a></p>`, non `<p><img></p>` — regex aggiornata per catturare entrambi |
| Mappa centrata solo sulla destinazione | Componente `FitBounds` con `useMap()` + `fitBounds([CAMP, gita])` |

## Come sviluppare localmente

```bash
cd next-site
npm run dev       # http://localhost:3000
npm run build     # build di produzione
npm test          # 8 test Vitest
```

Il dev server legge i markdown da `../content-monte-bianco/Gite/` — deve essere presente nella struttura
del repo (non serve alcuna variabile d'ambiente).

## Come pubblicare una modifica

1. Modificare i file in `next-site/` (o `content-monte-bianco/Gite/*.md` se si aggiunge una gita).
2. `git add` + `git commit` + `git push` su `main`.
3. Vercel rileva il push e rideploya automaticamente (build ~60s).
4. Non serve toccare `vercel.json`, non serve alcun comando Vercel CLI.

## Come aggiungere gite Komoot

Le gite Komoot vivono in `content-monte-bianco/Gite da Komoot/*.md` e vengono lette da `lib/komoot-hikes.ts`.

**Struttura frontmatter:**

```yaml
---
tags: [gita, komoot, <difficolta>, <zona>]   # difficolta: facile|moderato|difficile; zona: vedi ZONE_TAG_MAP
dislivello: "910 m"
lunghezza: "11,1 km"
tempo: "5h37"
difficolta: "Difficile"                        # Facile|Moderato|Difficile (usato da parseDifficulty)
coordinate: "45.5880, 7.3416"                  # lat, lon del punto di partenza
komoot: "https://www.komoot.com/it-it/tour/ID"
route: "[[lat,lon],[lat,lon],...]"             # JSON array campionato (ogni 8° punto)
imageUrl: "https://d2exd72xrrp1s7.cloudfront.net/..."
descrizione: "Breve descrizione per card/SEO."
waypoints:                                     # opzionale — solo se ci sono foto
  - name: "Nome waypoint"
    image: "https://d2exd72xrrp1s7.cloudfront.net/..."
---

# Titolo gita

![Titolo](imageUrl)
*Foto: [Komoot](komoot-url)*

## Dati tecnici

| | |
|---|---|
| **Difficoltà** | Difficile |
| **Dislivello positivo** | 910 m |
| **Lunghezza** | 11,1 km |
| **Tempo di percorrenza** | 5h37 |
| **Coordinate partenza** | `45.5880, 7.3416` ([mappa](https://www.google.com/maps?q=45.5880,7.3416)) |
| **Komoot** | [Apri su Komoot](komoot-url) |
```

**Come ottenere il tracciato GPS:**

Komoot non espone coordinate via API senza auth, ma le embeds nell'HTML della pagina come JSON escaped nel `__KOMOOT_STATE__`. Usare `curl` (non `WebFetch`, che perde i `<script>`) + Python:

```bash
curl -s "https://www.komoot.com/it-it/tour/TOUR_ID" \
  -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" \
  | python3 -c "
import sys, re, json
html = sys.stdin.read()
m = re.search(r'\\\\\\\\\"items\\\\\\\\\":\[(\{\\\\\\\\\"lat\\\\\\\\\".*?)\]\}', html)
if not m:
    m = re.search(r'\\\\\"items\\\\\":\[(\{\\\\\"lat\\\\\".*?)\]\}', html)
if m:
    raw = m.group(0)
    unescaped = raw.replace('\\\\\\\\\"', '\"').replace('\\\\\"', '\"')
    items_m = re.search(r'\[(\{\"lat\".*?)\]', unescaped)
    if items_m:
        items = json.loads('[' + items_m.group(1) + ']')
        sampled = items[::8]  # campiona ogni 8° punto (~40-100 punti)
        coords = [[round(p['lat'],5), round(p['lng'],5)] for p in sampled]
        print(json.dumps(coords))
"
```

La prima coordinata dell'array è il punto di partenza esatto.

**Zone tag valide** (da `ZONE_TAG_MAP` in `lib/hikes.ts`):
`gran-paradiso`, `cogne`, `monte-bianco`, `val-ferret`, `val-veny`, `courmayeur`, `la-thuile`, `cervino`, `monte-rosa`, `valpelline`

## Prossimi possibili passi

- **Metadata OG**: `generateMetadata` è implementato per le pagine gita, manca per homepage e `/mappa`.
- **Tile mappa**: attualmente OpenStreetMap standard. Per un look più minimal si può usare
  `https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png` (Stadia, free tier).
- **Filtro per zona**: rimosso con il redesign a sezioni; se si vuole reintrodurre, va ripensato
  come filtro secondario dentro ogni sezione difficoltà, non globale.
