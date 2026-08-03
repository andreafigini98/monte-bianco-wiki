# Handoff — Sito Next.js (monte-bianco-next)

Ultimo aggiornamento: 2026-08-03. Scritto per un agente che riprende questo progetto senza contesto pregresso.

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
│   ├── HomeClient.tsx       Homepage client: filtri, griglia card, animazioni framer-motion
│   ├── HikeCard.tsx         Card editoriale, aspect-[4/3] immagine, scala al hover
│   ├── FilterBar.tsx        Pill buttons con sfondo animato (layoutId spring)
│   ├── HikePageContent.tsx  Pagina gita client: animazioni fadeUp per ogni sezione
│   ├── Map.tsx              Leaflet map (NO SSR): marker colorati, polyline OSRM, popup
│   └── MapWrapper.tsx       'use client' + dynamic import con ssr:false (obbligatorio in Next.js 15)
└── lib/
    ├── hikes.ts             Data layer: tipi, getAllHikes(), getHikeBySlug(), toSlug()
    └── hikes.test.ts        8 test Vitest sul data layer
```

## Design system

- **Font**: Playfair Display (serif, titoli) + Geist (sans, corpo) — caricati da `next/font/google`
- **Palette**: stone (900/500/400/200/100/50) su sfondo bianco
- **Tailwind**: v3 (NON v4 — incompatibile con Node 18). Config: `tailwind.config.ts` con
  `require('@tailwindcss/typography')` e font family estesi.
- **Animazioni**: framer-motion — blur+slide dal basso per hero e card, `layoutId` per filtri e nav,
  `AnimatePresence mode="popLayout"` per le card che entrano/escono dai filtri.
- **Card**: nessun bordo, nessuna ombra — solo tipografia e immagine. Scala al hover (duration-700).

## Data layer (`lib/hikes.ts`)

```ts
const GITE_DIR = path.join(process.cwd(), '..', 'content-monte-bianco', 'Gite')
```

Legge i file markdown tramite `gray-matter` (frontmatter) + corpo grezzo. Cache module-level (`let _cache`)
corretta per SSG; da rimuovere se si passa a ISR o route dinamiche.

**Tipi principali:**
```ts
type DifficultyLevel = 'facile' | 'media' | 'impegnativa' | 'molto impegnativa'
type Zona = 'Gran Paradiso' | 'Monte Bianco' | 'Cervino' | 'Monte Rosa' | 'Valpelline' | 'Altro'
```

**Guard coordinate**: `hike.coordinate && !isNaN(lat) && !isNaN(lng)` — `Number('')` restituisce 0
(non NaN), quindi il check sulla stringa vuota è obbligatorio prima di `isNaN`.

## Rendering markdown (`app/gite/[slug]/page.tsx`)

```ts
const processed = await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(hike.content)
```

`remark-gfm` è indispensabile per le tabelle markdown (es. "Dati tecnici"). Senza di esso le pipe `|`
vengono renderizzate come testo grezzo.

## Mappa (`components/Map.tsx`)

- **Campeggio**: `CAMP = { lat: 45.7168, lng: 7.2619 }` — Camping Monte Bianco, Sarre (AO)
- **Rotta OSRM**: `https://router.project-osrm.org/route/v1/driving/...` — recupera polyline GeoJSON,
  la converte da `[lng, lat]` a `[lat, lng]` per Leaflet. Auto-carica la rotta se la mappa mostra
  una sola gita (pagina gita); in mappa globale si carica al click sul marker.
- **Google Maps deep link**: `https://www.google.com/maps/dir/?api=1&origin=CAMP&destination=GITA&travelmode=driving`
- **Stile popup**: inline styles dentro il JSX del Popup (non classi Tailwind — Leaflet monta il popup
  fuori dall'albero React, Tailwind non lo raggiunge). Override globali del wrapper in `globals.css`.
- **Colori difficoltà**: emerald (facile) · amber (media) · orange (impegnativa) · red (molto impegnativa)

**ATTENZIONE**: `MapWrapper` deve avere `'use client'` in cima — Next.js 15 vieta `ssr: false` nei
server component. `Map.tsx` stesso non ha `'use client'` esplicito, ma è importato solo da `MapWrapper`.

## Pattern server/client

Ogni pagina con dati dal filesystem segue questo schema:
1. **Server component** (`page.tsx`): chiama `getAllHikes()` o `getHikeBySlug()`, passa dati come props
2. **Client component** (`HomeClient.tsx`, `HikePageContent.tsx`): riceve i dati, gestisce animazioni e stato

Questo evita l'errore "cannot use fs in client component".

## Gotcha già risolti

| Problema | Soluzione |
|----------|-----------|
| Tailwind v4 incompatibile con Node 18 | Usa v3 con `tailwind.config.ts` e `@tailwind` directives |
| `params` in Next.js 15 | Deve essere `Promise<{ slug: string }>` e awaited |
| `MapWrapper` senza `'use client'` | Next.js 15 rifiuta `ssr: false` nei server component |
| Colore link nel popup Leaflet | Leaflet override CSS — aggiunto `.leaflet-popup-content a[style] { color: inherit !important; }` in globals.css |
| Tabelle markdown come pipe grezze | `remark-gfm` obbligatorio nel chain remark |
| `rootDirectory` in `vercel.json` | Rimosso — impostare Root Directory via Vercel UI |
| Coordinate stringa vuota (`''`) | Guard `hike.coordinate && !isNaN(lat)` prima del render |
| `getAllHikes()` nel client component | Spostare la chiamata nel server component, passare i dati come props |

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

## Prossimi possibili passi

- **Immagini reali**: `HikeCard` e `HikePageContent` usano `imageUrl` dal frontmatter ma non c'è ancora
  nessuna immagine vera nelle schede gite — tutte mostrano un placeholder grigio.
- **Metadata OG**: `generateMetadata` è implementato per le pagine gita, manca per homepage e `/mappa`.
- **Filtro zona + difficoltà combinato**: i filtri sono OR separati, non si può filtrare per "facile
  nel Gran Paradiso" contemporaneamente.
- **Tile mappa**: attualmente OpenStreetMap standard. Per un look più minimal si può usare
  `https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png` (Stadia, free tier).
