'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import {
  fetchKomootTour, publishKomootTour,
  listKomootTours, deleteKomootTour,
  createAttivita, listAttivita, deleteAttivita,
  type KomootData,
} from '@/app/actions/aggiungi-komoot'

const ZONE_OPTIONS = [
  'gran-paradiso', 'cogne', 'monte-bianco', 'val-ferret', 'val-veny',
  'courmayeur', 'la-thuile', 'cervino', 'monte-rosa', 'valpelline',
]

const DIFFICULTY_OPTIONS: Array<{ display: 'Facile' | 'Moderato' | 'Difficile'; tag: 'facile' | 'moderato' | 'difficile' }> = [
  { display: 'Facile', tag: 'facile' },
  { display: 'Moderato', tag: 'moderato' },
  { display: 'Difficile', tag: 'difficile' },
]

type Status = 'idle' | 'fetching' | 'preview' | 'publishing' | 'done' | 'error'

// ── helpers ──────────────────────────────────────────────────────────────────

function toId(title: string): string {
  return title.toLowerCase()
    .replace(/[àáâã]/g, 'a').replace(/[èéê]/g, 'e').replace(/[ìíî]/g, 'i')
    .replace(/[òóô]/g, 'o').replace(/[ùúû]/g, 'u')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1]) // strip data:...;base64,
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── EliminaSection ───────────────────────────────────────────────────────────

type FileEntry = { name: string; sha: string; tipo: 'gita' | 'attivita' }

function EliminaSection() {
  const [files, setFiles] = useState<FileEntry[] | null>(null)
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    const [gite, attivita] = await Promise.all([listKomootTours(), listAttivita()])
    setLoading(false)
    if (!gite.ok) { setError(gite.error); return }
    if (!attivita.ok) { setError(attivita.error); return }
    const all: FileEntry[] = [
      ...gite.files.map(f => ({ ...f, tipo: 'gita' as const })),
      ...attivita.files.map(f => ({ ...f, tipo: 'attivita' as const })),
    ]
    setFiles(all)
    if (all.length) setSelected(all[0].name)
  }

  async function handleDelete() {
    if (!files || !selected) return
    const file = files.find(f => f.name === selected)
    if (!file) return
    const label = file.tipo === 'gita' ? 'gita' : 'attività'
    if (!confirm(`Eliminare ${label} "${selected}"?`)) return
    setDeleting(true)
    setError(null)
    const res = file.tipo === 'gita'
      ? await deleteKomootTour(file.name, file.sha)
      : await deleteAttivita(file.name, file.sha)
    setDeleting(false)
    if (!res.ok) { setError(res.error); return }
    setDone(selected)
    const remaining = files.filter(f => f.name !== selected)
    setFiles(remaining)
    setSelected(remaining[0]?.name ?? '')
  }

  return (
    <div className="mt-16 border-t border-stone-100 pt-10">
      <h2 className="font-serif text-2xl text-stone-900 mb-1">Elimina</h2>
      <p className="text-stone-500 text-sm mb-6">Rimuove gite e attività dal repo. Vercel ridistribuisce automaticamente.</p>

      {files === null ? (
        <button onClick={load} disabled={loading}
          className="px-5 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-700 hover:border-stone-400 transition-colors disabled:opacity-40">
          {loading ? 'Carico…' : 'Carica lista'}
        </button>
      ) : files.length === 0 ? (
        <p className="text-stone-400 text-sm">Nessun elemento trovato.</p>
      ) : (
        <div className="flex gap-3 items-center flex-wrap">
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className="flex-1 min-w-0 border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-300"
          >
            <optgroup label="Gite">
              {files.filter(f => f.tipo === 'gita').map(f => (
                <option key={f.sha} value={f.name}>{f.name}</option>
              ))}
            </optgroup>
            <optgroup label="Attività">
              {files.filter(f => f.tipo === 'attivita').map(f => (
                <option key={f.sha} value={f.name}>{f.name}</option>
              ))}
            </optgroup>
          </select>
          <button onClick={handleDelete} disabled={deleting || !selected}
            className="px-5 py-2.5 bg-red-600 text-white text-sm rounded-lg disabled:opacity-40 hover:bg-red-700 transition-colors whitespace-nowrap">
            {deleting ? 'Elimino…' : 'Elimina'}
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-red-700 text-sm">{error}</p>}
      {done && <p className="mt-3 text-green-700 text-sm">"{done}" eliminata. Vercel ridistribuirà in ~60s.</p>}
    </div>
  )
}

// ── AggiungiAttivita ─────────────────────────────────────────────────────────

function AggiungiAttivita() {
  const [title, setTitle] = useState('')
  const [descrizione, setDescrizione] = useState('')
  const [categoria, setCategoria] = useState<'visite' | 'cibo'>('visite')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !descrizione.trim() || !imageFile) return
    setStatus('saving')
    setError(null)

    const ext = imageFile.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const id = toId(title)
    const imageBase64 = await fileToBase64(imageFile)

    const res = await createAttivita({ id, title: title.trim(), descrizione: descrizione.trim(), categoria, imageBase64, imageExt: ext })
    if (!res.ok) {
      setError(res.error)
      setStatus('error')
      return
    }
    setStatus('done')
  }

  if (status === 'done') return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-5">
      <p className="text-green-800 font-medium mb-1">Attività pubblicata!</p>
      <p className="text-green-700 text-sm mb-4">Vercel ridistribuirà in ~60s.</p>
      <button onClick={() => { setTitle(''); setDescrizione(''); setImageFile(null); setPreview(null); setStatus('idle') }}
        className="text-sm text-stone-500 hover:text-stone-900 underline">
        Aggiungi un&apos;altra
      </button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">Titolo</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
          className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-300"
          placeholder="Nome dell'attività" />
      </div>

      <div>
        <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">Descrizione</label>
        <textarea value={descrizione} onChange={e => setDescrizione(e.target.value)} required rows={3}
          className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
          placeholder="Breve descrizione per la card" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">Categoria</label>
          <select value={categoria} onChange={e => setCategoria(e.target.value as 'visite' | 'cibo')}
            className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-300">
            <option value="visite">Visite & Natura</option>
            <option value="cibo">Cibo & Aperitivo</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">Foto</label>
          <button type="button" onClick={() => inputRef.current?.click()}
            className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-600 hover:border-stone-400 transition-colors text-left">
            {imageFile ? imageFile.name : 'Seleziona foto…'}
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      </div>

      {preview && (
        <div className="relative aspect-[16/7] rounded-lg overflow-hidden bg-stone-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Anteprima" className="w-full h-full object-cover" />
        </div>
      )}

      {status === 'error' && error && (
        <p className="text-red-700 text-sm">{error}</p>
      )}

      <button type="submit" disabled={status === 'saving' || !title.trim() || !descrizione.trim() || !imageFile}
        className="w-full py-3 bg-stone-900 text-white rounded-lg text-sm disabled:opacity-40 hover:bg-stone-700 transition-colors">
        {status === 'saving' ? 'Pubblicazione…' : 'Pubblica su GitHub'}
      </button>
    </form>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AggiungiClient() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [data, setData] = useState<KomootData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [publishUrl, setPublishUrl] = useState<string | null>(null)
  const [zone, setZone] = useState('')
  const [difficulty, setDifficulty] = useState<'Facile' | 'Moderato' | 'Difficile'>('Moderato')
  const [difficultyTag, setDifficultyTag] = useState<'facile' | 'moderato' | 'difficile'>('moderato')

  async function handleFetch(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setStatus('fetching')
    setError(null)
    setData(null)

    const res = await fetchKomootTour(url.trim())
    if (!res.ok) {
      setError(res.error)
      setStatus('error')
      return
    }
    setData(res.data)
    setZone(res.data.zoneTag)
    setDifficulty(res.data.difficulty)
    setDifficultyTag(res.data.difficultyTag)
    setStatus('preview')
  }

  async function handlePublish() {
    if (!data) return
    setStatus('publishing')
    setError(null)

    const payload: KomootData = { ...data, zoneTag: zone, difficulty, difficultyTag }
    const res = await publishKomootTour(payload)
    if (!res.ok) {
      setError(res.error)
      setStatus('error')
      return
    }
    setPublishUrl(res.url)
    setStatus('done')
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">

      {/* ── Aggiungi gita Komoot ── */}
      <h1 className="font-serif text-4xl text-stone-900 mb-2">Aggiungi gita</h1>
      <p className="text-stone-500 mb-8 text-sm">Incolla il link di un tour Komoot pubblico — i dati vengono estratti automaticamente e il file viene creato su GitHub.</p>

      <form onSubmit={handleFetch} className="flex gap-3 mb-10">
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://www.komoot.com/it-it/tour/1234567890"
          className="flex-1 border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300"
          disabled={status === 'fetching' || status === 'publishing'}
        />
        <button
          type="submit"
          disabled={!url.trim() || status === 'fetching' || status === 'publishing'}
          className="px-5 py-3 bg-stone-900 text-white text-sm rounded-lg disabled:opacity-40 hover:bg-stone-700 transition-colors"
        >
          {status === 'fetching' ? 'Carico…' : 'Anteprima'}
        </button>
      </form>

      {status === 'error' && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm mb-6">
          {error}
        </div>
      )}

      {status === 'done' && publishUrl && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-green-800 font-medium mb-2">Gita pubblicata!</p>
          <p className="text-green-700 text-sm mb-4">Vercel ridistribuirà automaticamente in ~60s.</p>
          <a href={publishUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs text-green-700 underline break-all">
            {publishUrl}
          </a>
          <div className="mt-6">
            <button onClick={() => { setStatus('idle'); setUrl(''); setData(null); setPublishUrl(null) }}
              className="text-sm text-stone-500 hover:text-stone-900 underline">
              Aggiungi un&apos;altra
            </button>
          </div>
        </div>
      )}

      {(status === 'preview' || status === 'publishing') && data && (
        <div className="border border-stone-200 rounded-xl overflow-hidden">
          {data.imageUrl && (
            <div className="relative aspect-[16/7] bg-stone-100">
              <Image src={data.imageUrl} alt={data.title} fill className="object-cover" sizes="672px" />
            </div>
          )}

          <div className="p-6 space-y-6">
            <h2 className="font-serif text-2xl text-stone-900 leading-snug">{data.title}</h2>

            <dl className="grid grid-cols-3 gap-4">
              {[['Dislivello', data.dislivello], ['Lunghezza', data.lunghezza], ['Tempo', data.tempo]].map(([label, val]) => (
                <div key={label} className="bg-stone-50 rounded-lg p-3">
                  <dt className="text-xs text-stone-400 uppercase tracking-wider mb-1">{label}</dt>
                  <dd className="text-stone-900 font-medium">{val}</dd>
                </div>
              ))}
            </dl>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">Zona</label>
                <select value={zone} onChange={e => setZone(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-300">
                  {ZONE_OPTIONS.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">Difficoltà</label>
                <select value={difficulty}
                  onChange={e => {
                    const opt = DIFFICULTY_OPTIONS.find(o => o.display === e.target.value)
                    if (opt) { setDifficulty(opt.display); setDifficultyTag(opt.tag) }
                  }}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-300">
                  {DIFFICULTY_OPTIONS.map(o => <option key={o.tag} value={o.display}>{o.display}</option>)}
                </select>
              </div>
            </div>

            <p className="text-xs text-stone-400">
              Partenza: <code className="text-stone-600">{data.coordinate || '—'}</code>
              {' · '}{data.waypoints.length} waypoints
            </p>

            {data.waypoints.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {data.waypoints.map((w, i) => (
                  <div key={i} className="relative w-20 h-16 rounded-lg overflow-hidden bg-stone-100">
                    <Image src={w.image} alt={w.name} fill className="object-cover" sizes="80px" />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5">
                      <p className="text-white text-[9px] truncate">{w.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={handlePublish} disabled={status === 'publishing'}
              className="w-full py-3 bg-stone-900 text-white rounded-lg text-sm disabled:opacity-40 hover:bg-stone-700 transition-colors">
              {status === 'publishing' ? 'Pubblicazione…' : 'Pubblica su GitHub'}
            </button>
          </div>
        </div>
      )}

      {/* ── Aggiungi attività ── */}
      <div className="mt-16 border-t border-stone-100 pt-10">
        <h2 className="font-serif text-3xl text-stone-900 mb-2">Aggiungi attività</h2>
        <p className="text-stone-500 text-sm mb-8">Crea una card per la sezione Visite & Natura o Cibo & Aperitivo.</p>
        <AggiungiAttivita />
      </div>

      {/* ── Elimina ── */}
      <EliminaSection />
    </div>
  )
}
