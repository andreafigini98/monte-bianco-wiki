import { cookies } from 'next/headers'
import SecretLogin from '@/components/SecretLogin'
import TodoList from '@/components/TodoList'

async function tokenFor(password: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export const metadata = { title: '🤫' }

export default async function SecretoPage() {
  const jar = await cookies()
  const token = jar.get('secret-auth')?.value
  const expected = await tokenFor(process.env.SECRET_PASSWORD ?? '')

  if (token !== expected) return <SecretLogin />
  return <TodoList />
}
