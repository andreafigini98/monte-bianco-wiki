# Design: Sito Next.js — Monte Bianco Wiki

**Data**: 2026-08-03  
**Stato**: approvato  
**Scope**: nuovo sito Next.js separato dal Quartz esistente, deploy su Vercel

---

## Contesto

Il repo contiene già un sito Quartz pubblicato su GitHub Pages (`andreafigini98.github.io/monte-bianco-wiki`). Questo progetto aggiunge un **secondo sito indipendente** in Next.js con URL Vercel proprio, che legge lo stesso contenuto Markdown ma offre un'esperienza più moderna: griglia filtrabile, schede gita con mini-mappa, mappa interattiva unificata.

Contenuto sorgente: 21 gite in `content-monte-bianco/Gite/*.md`, ognuna con frontmatter strutturato.

---

## Architettura

**Cartella**: `next-site/` nella root del repo (il Quartz in `quartz-site/` resta intatto).

```
next-site/
├── app/
│   ├── layout.tsx             Nav globale + font (Geist, già bundled)
│   ├── page.tsx               Home: hero + FilterBar + griglia HikeCard
│   ├── gite/[slug]/page.tsx   Scheda singola gita
│   └── mappa/page.tsx         Mappa full-screen con tutti i pin
├── components/
│   ├── HikeCard.tsx           Card con immagine, badge difficoltà, stats
│   ├── FilterBar.tsx          Dropdown difficoltà + zona, filtro client-side
│   └── Map.tsx                react-leaflet, dynamic import SSR disabled
├── lib/
│   └── hikes.ts               Legge ../content-monte-bianco/Gite/*.md con gray-matter
└── public/                    (nessun asset speciale)
```

**Flusso dati**: solo build time. `lib/hikes.ts` legge i `.md` con `gray-matter`, restituisce array tipizzato. Le pagine usano `generateStaticParams` per pre-generare tutti gli slug. Nessuna API, nessun DB.

---

## Struttura dati

```ts
type Hike = {
  slug: string        // nome file normalizzato → URL segment
  title: string       // titolo H1 estratto dal body markdown
  difficolta: string  // "facile (T)" | "media (E)" | "impegnativa (EE)" | "molto impegnativa (EEA)"
  dislivello: string  // es. "~920 m"
  lunghezza: string   // es. "~9 km (a/r)"
  tempo: string       // es. "~4h30 (2h30 salita, 2h discesa)"
  da_base: string     // es. "24,8 km — ~30 min"
  coordinate: string  // es. "45.5867, 7.3412"
  descrizione: string // one-liner per la card (campo frontmatter)
  tags: string[]      // usati per zona (gran-paradiso, monte-bianco, ecc.)
  zona: Zona          // derivata dai tags
  content: string     // corpo markdown grezzo
}

type Zona = 'Gran Paradiso' | 'Monte Bianco' | 'Cervino' | 'Monte Rosa' | 'Valpelline'
type Difficolta = 'facile' | 'media' | 'impegnativa' | 'molto impegnativa'
```

**Mapping zona**: funzione in `lib/hikes.ts` che legge i `tags` frontmatter e restituisce la `Zona` corrispondente (tag `gran-paradiso` → `'Gran Paradiso'`, ecc.).

---

## Pagine e componenti

### Home (`/`)
- **Hero**: titolo + sottotitolo + sfondo montagna (CSS gradient o immagine pubblica)
- **FilterBar**: due `<select>` — Difficoltà e Zona. Stato locale React, filtro client-side senza reload
- **Griglia HikeCard**: risponsiva (1 col mobile, 2 tablet, 3 desktop)

### HikeCard
- Immagine da Wikimedia Commons (URL già nel body markdown — estratto con regex o hardcoded per le 21 gite)
- Nome gita
- Badge difficoltà colorato (verde/giallo/arancio/rosso)
- Stats inline: dislivello · lunghezza · tempo · distanza dal campeggio
- Click → `/gite/[slug]`

### Scheda gita (`/gite/[slug]`)
- Header: nome + badge difficoltà
- Tabella dati tecnici (frontmatter)
- Body markdown renderizzato con `remark` → HTML (più leggero di MDX per contenuto statico)
- Mini-mappa con singolo pin del punto di partenza (react-leaflet, dynamic import)
- Link "← Tutte le gite"

### Mappa (`/mappa`)
- Leaflet full-screen
- 21 pin, colore = difficoltà (verde / giallo / rosso)
- Popup per pin: nome + difficoltà + link alla scheda
- dynamic import con `ssr: false`

---

## Stack

| Pacchetto | Versione | Uso |
|---|---|---|
| `next` | 15 | framework |
| `react` | 19 | UI |
| `tailwindcss` | 4 | stile |
| `gray-matter` | ^4 | parse frontmatter MD |
| `remark` + `remark-html` | latest | MD → HTML |
| `react-leaflet` + `leaflet` | ^4 | mappa interattiva |

Font: Geist (già bundled con Next.js 15, zero import aggiuntivi).

---

## Stile

Palette montagna: grigio ardesia (`slate-*`), verde alpino (`emerald-*`), bianco neve. Dark mode non richiesta nella v1.

Badge difficoltà:
- Facile → `emerald` (verde)
- Media → `yellow` (giallo)
- Impegnativa → `orange` (arancio)
- Molto impegnativa → `red` (rosso)

---

## Deploy

- Cartella `next-site/` rilevata automaticamente da Vercel (zero config)
- `vercel.json` minimo solo se necessario per il root directory
- Il Quartz su GitHub Pages resta invariato

---

## Fuori scope (v1)

- Dark mode
- Ricerca full-text
- Preferiti / localStorage
- Autenticazione
- CMS headless
