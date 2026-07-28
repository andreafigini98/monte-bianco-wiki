#!/usr/bin/env python3
"""Rigenera static/mappa-monte-bianco.html leggendo il frontmatter di ogni nota in Gite/.

Uso: python3 static/genera_mappa.py   (va lanciato dalla cartella content-forni-di-sopra/,
oppure da qualunque punto: i percorsi sono relativi alla posizione di questo script)
"""
import os, re, json, urllib.parse

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(SCRIPT_DIR)  # content-forni-di-sopra/
GITE = os.path.join(ROOT, "Gite")
STATIC = SCRIPT_DIR

# Base del sito pubblicato: usata per costruire il link "vai alla gita" nei popup della mappa.
# Va aggiornata se cambia il nome utente/repo GitHub Pages.
SITE_BASE = "https://andreafigini98.github.io/monte-bianco-wiki"


def quartz_slug(name):
    """Riproduce lo slug che Quartz genera per un file: spazi -> trattini, resto invariato."""
    return urllib.parse.quote(name.replace(" ", "-"), safe="-_.,()!'")

FIELD_RE = re.compile(r'^(\w+):\s*(.*)$')


def parse_frontmatter(text):
    m = re.match(r'^---\n(.*?)\n---\n', text, re.S)
    if not m:
        return {}
    fm = {}
    for line in m.group(1).split("\n"):
        line = line.rstrip()
        if not line.strip():
            continue
        km = FIELD_RE.match(line)
        if not km:
            continue
        key, val = km.group(1), km.group(2).strip()
        if val.startswith("[") and val.endswith("]"):
            items = [x.strip() for x in val[1:-1].split(",")]
            fm[key] = items
        elif val.startswith('"') and val.endswith('"'):
            fm[key] = val[1:-1]
        else:
            fm[key] = val
    return fm


DIFF_COLOR = {"facile": "#2f9e44", "media": "#f08c00", "impegnativa": "#e03131"}


def diff_key(tags):
    for t in tags:
        if t in DIFF_COLOR:
            return t
    return "media"


def main():
    points = []
    md_files = [f for f in sorted(os.listdir(GITE)) if f.endswith(".md")]
    for fname in md_files:
        path = os.path.join(GITE, fname)
        text = open(path, encoding="utf-8").read()
        fm = parse_frontmatter(text)
        coord = fm.get("coordinate", "").replace(" ", "")
        parts = coord.split(",")
        if len(parts) != 2:
            print("COORD MANCANTE:", fname)
            continue
        try:
            lat, lon = float(parts[0]), float(parts[1])
        except ValueError:
            print("COORD NON VALIDA:", fname, coord)
            continue
        tags = fm.get("tags", [])
        dk = diff_key(tags)
        name = os.path.splitext(fname)[0]
        points.append({
            "name": name,
            "url": f"{SITE_BASE}/Gite/{quartz_slug(name)}",
            "lat": lat,
            "lon": lon,
            "difficolta": fm.get("difficolta", ""),
            "dislivello": fm.get("dislivello", ""),
            "lunghezza": fm.get("lunghezza", ""),
            "tempo": fm.get("tempo", ""),
            "da_base": fm.get("da_base", ""),
            "descrizione": fm.get("descrizione", ""),
            "color": DIFF_COLOR[dk],
            "diff_key": dk,
        })

    camp_text = open(os.path.join(ROOT, "Campeggio.md"), encoding="utf-8").read()
    camp_fm = parse_frontmatter(camp_text)
    camp_coord = camp_fm.get("coordinate", "46.4099, 12.5988").replace(" ", "")
    camp_lat, camp_lon = [float(x) for x in camp_coord.split(",")]

    print(f"{len(points)} gite geolocalizzate su {len(md_files)} file")

    points_json = json.dumps(points, ensure_ascii=False)

    html_out = f"""<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mappa Gite — Monte Bianco</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
<style>
  html, body {{ margin: 0; padding: 0; height: 100%; font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; }}
  #map {{ width: 100%; height: 100vh; }}
  .legend {{
    position: absolute; z-index: 1000; bottom: 24px; left: 12px;
    background: rgba(255,255,255,0.95); padding: 10px 14px; border-radius: 8px;
    box-shadow: 0 1px 6px rgba(0,0,0,0.3); font-size: 13px; line-height: 1.6;
  }}
  .legend span.dot {{ display:inline-block; width:11px; height:11px; border-radius:50%; margin-right:6px; vertical-align:middle; }}
  .popup-title {{ font-weight: 600; font-size: 14px; margin-bottom: 4px; }}
  .popup-title a {{ color: #1d4ed8; text-decoration: none; }}
  .popup-title a:hover {{ text-decoration: underline; }}
  @media (prefers-color-scheme: dark) {{
    .popup-title a {{ color: #7aa2ff; }}
  }}
  .popup-badge {{
    display:inline-block; padding:1px 7px; border-radius:10px; color:#fff; font-size:11px; margin-bottom:6px;
  }}
  .popup-table {{ font-size: 12.5px; }}
  .popup-table td:first-child {{ color:#666; padding-right:8px; white-space:nowrap; }}
  .popup-desc {{ font-size:12.5px; margin-top:6px; color:#333; max-width:230px; }}
  @media (prefers-color-scheme: dark) {{
    .legend {{ background: rgba(30,30,30,0.92); color: #eee; }}
    .popup-desc {{ color:#ccc; }}
  }}
</style>
</head>
<body>
<div id="map"></div>
<div class="legend">
  <div><span class="dot" style="background:#1d9bf0"></span>Campeggio (base)</div>
  <div><span class="dot" style="background:#2f9e44"></span>Facile</div>
  <div><span class="dot" style="background:#f08c00"></span>Media</div>
  <div><span class="dot" style="background:#e03131"></span>Impegnativa</div>
</div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
<script>
  const CAMP = [{camp_lat}, {camp_lon}];
  const POINTS = {points_json};

  const map = L.map('map').setView(CAMP, 10);
  L.tileLayer('https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png', {{
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }}).addTo(map);

  L.circleMarker(CAMP, {{
    radius: 9, color: '#1d9bf0', fillColor: '#1d9bf0', fillOpacity: 0.9, weight: 2
  }}).addTo(map).bindPopup('<div class="popup-title">⛺ Campeggio — base</div>');

  const bounds = [CAMP];
  POINTS.forEach(p => {{
    const marker = L.circleMarker([p.lat, p.lon], {{
      radius: 7, color: p.color, fillColor: p.color, fillOpacity: 0.85, weight: 1.5
    }}).addTo(map);
    bounds.push([p.lat, p.lon]);
    const popup = `
      <div class="popup-title"><a href="${{p.url}}" target="_top" rel="noopener">${{p.name}} →</a></div>
      <span class="popup-badge" style="background:${{p.color}}">${{p.difficolta}}</span>
      <table class="popup-table">
        <tr><td>Dislivello</td><td>${{p.dislivello}}</td></tr>
        <tr><td>Lunghezza</td><td>${{p.lunghezza}}</td></tr>
        <tr><td>Tempo</td><td>${{p.tempo}}</td></tr>
        <tr><td>Dal campeggio</td><td>${{p.da_base}}</td></tr>
      </table>
      <div class="popup-desc">${{p.descrizione}}</div>
    `;
    marker.bindPopup(popup, {{ maxWidth: 260 }});
  }});

  map.fitBounds(bounds, {{ padding: [30, 30] }});
</script>
</body>
</html>
"""

    out_path = os.path.join(STATIC, "mappa-monte-bianco.html")
    open(out_path, "w", encoding="utf-8").write(html_out)
    print("scritto:", out_path)


if __name__ == "__main__":
    main()
