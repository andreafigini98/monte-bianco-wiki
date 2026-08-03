import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

async function tokenFor(password: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth')?.value
  const expected = await tokenFor(process.env.AUTH_PASSWORD ?? '')

  if (token === expected) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = '/login'
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!login|_next/static|_next/image|favicon.ico).*)'],
}
