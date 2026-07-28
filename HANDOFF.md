# Handoff — Wiki Valle d'Aosta (Camping Monte Bianco)

Ultimo aggiornamento: 2026-07-28. Scritto per un agente che riprende questo progetto senza contesto pregresso.
Questo repo è un fratello di [dolomiti-friulane-wiki](https://github.com/andreafigini98/dolomiti-friulane-wiki):
stessa struttura, stesso workflow, stesse regole — cambia solo la base geografica.

## Cos'è questo repo

Wiki escursionistica in stile Obsidian per una vacanza in **Valle d'Aosta**, pubblicata come sito statico con
**Quartz**. L'utente (Andrea) campeggia al **Camping Monte Bianco**, Frazione Saint Maurice 15, **Sarre (AO)**,
una base quasi centrale nella regione: da qui si raggiungono in meno di 1h30 d'auto sia il Monte Bianco
(Courmayeur), sia il Gran Paradiso (Cogne), sia il Cervino e il Monte Rosa (Cervinia, Gressoney).

- **Repo GitHub**: https://github.com/andreafigini98/monte-bianco-wiki (pubblico)
- **Sito pubblicato**: https://andreafigini98.github.io/monte-bianco-wiki/
- **Account GitHub**: `andreafigini98` (personale — vedi sezione Identità git sotto)

## Struttura del repo

```
content-monte-bianco/        LA WIKI ATTIVA — fonte di verità, si modifica sempre qui
├── 00 - Indice.md           indice generale + elenco gite per difficoltà
├── 01 - Info Pratiche 2026.md
├── 02 - Mappa Interattiva.md   pagina che incorpora la mappa Leaflet via iframe
├── 03 - Settimana Tipo.md
├── Campeggio.md             coordinate del campeggio (frontmatter `coordinate:`)
├── index.md                 copia di 00 - Indice.md (pagina iniziale del vault/sito)
├── Mappa Gite.base          Obsidian "Bases" — mappa nativa dentro l'app Obsidian (non pubblicabile sul sito)
├── Gite/                    6 file .md, uno per gita (vedi formato sotto)
└── static/
    ├── genera_mappa.py      script che rigenera la mappa Leaflet leggendo il frontmatter di Gite/*.md
    └── mappa-monte-bianco.html   output generato (Leaflet standalone, CDN openstreetmap+leaflet)

quartz-site/                 progetto Quartz v5 — genera il sito pubblicato
├── content/                 COPIA di content-monte-bianco/ (tranne static/) — va risincronizzata a mano
├── quartz/static/mappa-monte-bianco.html   COPIA della mappa, l'UNICA che finisce online (vedi sotto il perché)
├── quartz.config.yaml       config Quartz (titolo, baseUrl, tema)
└── (resto = framework Quartz, non toccare)

.github/workflows/deploy.yaml   workflow di build+deploy su GitHub Pages (DEVE stare qui, non in quartz-site/)
.gitignore
HANDOFF.md                  questo file
```

## Identità git e autenticazione (già configurate)

- **Config git locale al repo** (non globale): `git config --local user.email andrea.figini98@gmail.com` /
  `user.name "andrea figini"`. La config globale del sistema ha un'email di lavoro diversa: **non usarla qui**.
- **gh CLI**: `~/.local/bin/gh` (serve `export PATH="$HOME/.local/bin:$PATH"`). Autenticato come `andreafigini98`
  con scope `repo` + `workflow`.
- **GitHub Pages** è abilitato con sorgente "GitHub Actions" (`gh api -X POST repos/andreafigini98/monte-bianco-wiki/pages -f build_type=workflow`, già fatto). Non serve rifarlo.

## Come si pubblica una modifica (workflow standard)

1. Modifica i file in `content-monte-bianco/` (fonte di verità).
2. Se hai aggiunto/modificato una gita e vuoi che compaia sulla mappa:
   ```bash
   cd content-monte-bianco && python3 static/genera_mappa.py
   ```
3. Sincronizza il contenuto nella copia usata da Quartz (esclusa `static/`, gestita a parte):
   ```bash
   cd /home/andrea/code/monte-bianco-wiki
   rsync -a --delete content-monte-bianco/ quartz-site/content/ --exclude static
   cp content-monte-bianco/static/mappa-monte-bianco.html quartz-site/quartz/static/mappa-monte-bianco.html
   ```
4. (Opzionale ma consigliato) build locale di verifica prima di pushare:
   ```bash
   cd quartz-site && npx quartz build
   ```
5. Commit e push da root del repo sul branch `main` — il workflow GitHub Actions builda e pubblica su Pages
   automaticamente in ~30-40 secondi.
   ```bash
   export PATH="$HOME/.local/bin:$PATH"
   git add -A && git commit -m "..." && git push
   RUN_ID=$(gh run list --limit 1 --json databaseId -q '.[0].databaseId')
   gh run watch "$RUN_ID" --exit-status
   ```

## Gotcha di Quartz (già risolti una volta — non ripetere gli errori)

Identici a quelli del repo gemello dolomiti-friulane-wiki:

1. I workflow GitHub Actions funzionano solo in `.github/workflows/` alla radice del repo.
2. Qualsiasi file dentro `content/` viene trattato da Quartz come pagina: un file non-`.md` come la mappa HTML va
   messo in `quartz-site/quartz/static/` (l'unica cartella copiata verbatim).
3. Il link-resolver di Quartz riscrive tutti gli `href`/`src`, inclusi quelli in tag HTML grezzi (`<iframe>`):
   l'unico modo per non farlo toccare è un URL assoluto completo con dominio.
4. Slug delle pagine: `Nome File.md` → `Nome-File.html` (spazi → trattini, resto invariato). Lo script
   `genera_mappa.py` replica questa regola in `quartz_slug()`.
5. Serve il pacchetto tema esplicito (`@quartz-themes/default`, già in `package.json`).
6. Controllare sempre `git remote -v` dopo `quartz create`/reinstallazioni per eventuali remote "upstream" indesiderati.
7. `baseUrl` in `quartz.config.yaml` è `andreafigini98.github.io/monte-bianco-wiki`: da aggiornare se il repo cambia nome.

## Formato di una scheda gita (`Gite/*.md`)

Identico al vault gemello — vedi frontmatter con `tags`, `dislivello`, `lunghezza`, `tempo`, `difficolta`,
`coordinate`, `da_base`, `descrizione`; poi nel corpo: titolo, foto Wikimedia Commons con fonte citata,
descrizione, tabella "Dati tecnici", "Come arrivare al punto di partenza", "Il percorso", "Restrizioni,
prenotazioni e parcheggi" (callout `[!warning]`), "Consigli", "Fonti" (sempre almeno 2 link reali, mai inventati).

**Regola fondamentale**: nessun percorso è mai stato inventato. Ogni dato tecnico viene da una fonte reale citata
in fondo alla pagina (parchi nazionali, portali turistici Valle d'Aosta, blog di escursionismo verificati).

## Stato attuale dei contenuti

- **6 gite** iniziali, verificate con fonti reali, scelte per coprire i quattro gruppi montuosi raggiungibili da
  Sarre in meno di 1h30: Gran Paradiso/Cogne (Rifugio Vittorio Sella, Cascate di Lillaz), Monte Bianco/Courmayeur
  (Rifugio Bonatti, Rifugio Elisabetta), Cervino/Cervinia (Colle Superiore delle Cime Bianche), Monte Rosa/Gressoney
  (Rifugio e Lago Gabiet).
- Coordinate del campeggio geocodificate su OpenStreetMap (Nominatim), distanze in auto calcolate via OSRM.
- Il vault è pensato per crescere: Cogne/Gran Paradiso da solo ha molte altre mete valide (Lauson, Herbetet,
  Rifugio Sella con anello lungo), così come Val Ferret (Rifugio Bertone), Val Veny (Lago del Miage), Champoluc/Val
  d'Ayas (non ancora coperta).

## Cose da sapere / possibili prossimi passi

- Nessuna automazione creata per i passaggi di sync (rigenerare mappa → rsync → copiare mappa in
  quartz-site/quartz/static/): dimenticarne uno è la causa più probabile di "il sito non si aggiorna". Coerente
  con la scelta fatta nel repo gemello (l'utente aveva rifiutato l'automazione lì).
- Se si aggiungono nuove gite, seguire lo stesso rigore di verifica fonti già applicato: niente percorsi inventati,
  sempre almeno 2 fonti reali, verificare incrocio dati (dislivello/lunghezza/tempo) tra più fonti quando discordano.
