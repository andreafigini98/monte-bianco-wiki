import { kv } from '@vercel/kv'

export type Schedule = Record<string, string[]> // dateKey → slug[]

const KEY = 'calendario-agosto-2026'

export async function getSchedule(): Promise<Schedule> {
  try {
    return (await kv.get<Schedule>(KEY)) ?? {}
  } catch {
    return {}
  }
}

export async function saveSchedule(schedule: Schedule): Promise<void> {
  await kv.set(KEY, schedule)
}
