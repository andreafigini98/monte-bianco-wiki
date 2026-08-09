import { ATTIVITA } from '@/lib/activities'
import AttivitaClient from '@/components/AttivitaClient'

export const metadata = { title: 'Attività — Valle d\'Aosta' }

export default function AttivitaPage() {
  return <AttivitaClient attivita={ATTIVITA} />
}
