'use client'
import { useActionState } from 'react'
import { login } from '@/app/actions/auth'

const initial = { error: '' }

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, initial)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <div className="w-full max-w-sm space-y-10">

        {/* Wordmark */}
        <div className="text-center space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-stone-400">Valle d&apos;Aosta · Estate 2026</p>
          <h1 className="font-serif text-3xl font-bold text-stone-900">Monte Bianco Wiki</h1>
        </div>

        {/* Divider */}
        <div className="h-px bg-stone-100" />

        {/* Form */}
        <form action={action} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="password" className="text-[10px] uppercase tracking-widest text-stone-400">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoFocus
              autoComplete="current-password"
              className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-900 placeholder-stone-300 outline-none focus:border-stone-900 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {state.error && (
            <p className="text-xs text-red-500">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-stone-900 text-white text-xs uppercase tracking-widest font-medium py-3 rounded-lg hover:bg-stone-700 disabled:opacity-50 transition-colors"
          >
            {pending ? 'Accesso…' : 'Entra'}
          </button>
        </form>

      </div>
    </div>
  )
}
