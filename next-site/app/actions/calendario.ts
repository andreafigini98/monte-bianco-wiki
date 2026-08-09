'use server'
import { revalidatePath } from 'next/cache'
import { saveSchedule, type Schedule } from '@/lib/calendario'

export async function persistSchedule(schedule: Schedule): Promise<void> {
  try {
    await saveSchedule(schedule)
  } catch {}
  revalidatePath('/calendario')
}
