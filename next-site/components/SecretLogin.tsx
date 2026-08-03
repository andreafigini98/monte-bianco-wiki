'use client'
import { useActionState } from 'react'
import { secretLogin } from '@/app/actions/secret-auth'

export default function SecretLogin() {
  const [state, action, pending] = useActionState(secretLogin, { error: '' })

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-xs space-y-8">
        <div className="text-center">
          <p className="text-4xl mb-3">🤫</p>
          <p className="text-xs uppercase tracking-widest text-stone-400">Accesso riservato</p>
        </div>

        <div className="h-px bg-stone-100" />

        <form action={action} className="space-y-4">
          <input
            name="password"
            type="password"
            autoFocus
            autoComplete="off"
            placeholder="••••••••"
            className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-900 placeholder-stone-300 outline-none focus:border-stone-900 transition-colors"
          />

          {state.error && (
            <p className="text-xs text-red-500">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-stone-900 text-white text-xs uppercase tracking-widest font-medium py-3 rounded-lg hover:bg-stone-700 disabled:opacity-50 transition-colors"
          >
            {pending ? '…' : 'Entra'}
          </button>
        </form>
      </div>
    </div>
  )
}
