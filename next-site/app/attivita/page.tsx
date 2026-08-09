import AttivitaClient from '@/components/AttivitaClient'

export const metadata = { title: 'Attività — Valle d\'Aosta' }

export type Categoria = 'visite' | 'cibo'

export type Attivita = {
  id: string
  title: string
  descrizione: string
  imageUrl: string
  categoria: Categoria
}

const ATTIVITA: Attivita[] = [
  {
    id: 'qc-terme',
    title: 'QC Terme Pré Saint Didier',
    descrizione: 'Terme panoramiche ai piedi del Monte Bianco, con piscine all\'aperto, saune e grotte di vapore con vista sulle vette.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Le_Mont-Blanc_depuis_Pr%C3%A9-Saint-Didier_-_panoramio.jpg',
    categoria: 'visite',
  },
  {
    id: 'orrido',
    title: 'Orrido di Pré-Saint-Didier',
    descrizione: 'Gola selvaggia scavata dal torrente Verney, con passerelle sospese tra pareti rocciose e cascate spettacolari.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Orrido_di_Pr%C3%A8_Saint_Didier_-_14448301479.jpg',
    categoria: 'visite',
  },
  {
    id: 'cogne',
    title: 'Visita Cogne',
    descrizione: 'Grazioso borgo alpino nel cuore del Parco Nazionale del Gran Paradiso, famoso per il merletto al tombolo e i prati di Sant\'Orso.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Comune_di_Cogne.jpg',
    categoria: 'visite',
  },
  {
    id: 'aosta',
    title: 'Visita Aosta',
    descrizione: 'La piccola Roma delle Alpi: teatro romano, arco di Augusto, Porta Pretoria e il centro medievale tutto da esplorare a piedi.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/2104AostaTeatroRomano.jpg',
    categoria: 'visite',
  },
  {
    id: 'aperitivo-pila',
    title: 'Aperitivo a Pila',
    descrizione: 'Aperitivo al tramonto a 1800 m, con vista panoramica su Aosta e la Valle. Raggiungibile in cabinovia da Aosta.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Pila_panorama.jpg',
    categoria: 'cibo',
  },
  {
    id: 'cena-ristorante',
    title: 'Cena al Ristorante',
    descrizione: 'Cucina valdostana tradizionale: fonduta, carbonade, gnocchi con lardo d\'Arnad e il celebre vino Torrette.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Gnocchi_di_patate_con_rucola_e_Lard_dArnad.jpg',
    categoria: 'cibo',
  },
]

export default function AttivitaPage() {
  return <AttivitaClient attivita={ATTIVITA} />
}
