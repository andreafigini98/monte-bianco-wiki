'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function tokenFor(password: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function login(_: unknown, formData: FormData): Promise<{ error: string }> {
  const password = (formData.get('password') as string) ?? ''
  const submitted = await tokenFor(password)
  const expected = await tokenFor(process.env.AUTH_PASSWORD ?? '')

  if (submitted !== expected) {
    return { error: 'Password errata.' }
  }

  const jar = await cookies()
  jar.set('auth', submitted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  redirect('/')
}
