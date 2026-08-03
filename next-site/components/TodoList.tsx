'use client'
import { useState, useTransition, useRef } from 'react'
import { addTodo, toggleTodo, deleteTodo } from '@/app/actions/todos'
import type { Todo } from '@/lib/todos'

export default function TodoList({ todos }: { todos: Todo[] }) {
  const [input, setInput] = useState('')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleAdd() {
    const text = input.trim()
    if (!text) return
    setInput('')
    inputRef.current?.focus()
    startTransition(() => addTodo(text))
  }

  const open = todos.filter(t => !t.done)
  const done = todos.filter(t => t.done)

  return (
    <main className="max-w-xl mx-auto px-6 md:px-12 py-12">

      {/* Header */}
      <div className="mb-10 space-y-1">
        <p className="text-3xl">🤫</p>
        <h1 className="font-serif text-3xl font-bold text-stone-900">To do</h1>
        <p className="text-xs uppercase tracking-widest text-stone-400">
          {open.length} da fare · {done.length} fatte
        </p>
      </div>

      <div className="h-px bg-stone-100 mb-8" />

      {/* Add item */}
      <div className="flex gap-3 mb-10">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Nuova cosa da fare…"
          disabled={isPending}
          className="flex-1 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-900 placeholder-stone-300 outline-none focus:border-stone-900 disabled:opacity-50 transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim() || isPending}
          className="px-5 py-2.5 bg-stone-900 text-white text-xs uppercase tracking-widest rounded-lg hover:bg-stone-700 disabled:opacity-30 transition-colors"
        >
          +
        </button>
      </div>

      {/* Open items */}
      {open.length > 0 && (
        <ul className="space-y-2 mb-10">
          {open.map(t => (
            <li key={t.id} className="flex items-center gap-3 group py-2 border-b border-stone-50">
              <button
                onClick={() => startTransition(() => toggleTodo(t.id))}
                disabled={isPending}
                className="w-4 h-4 rounded-full border border-stone-300 hover:border-stone-900 disabled:opacity-40 transition-colors flex-shrink-0"
              />
              <span className="flex-1 text-sm text-stone-800">{t.text}</span>
              <button
                onClick={() => startTransition(() => deleteTodo(t.id))}
                disabled={isPending}
                className="text-stone-200 hover:text-red-400 disabled:opacity-40 transition-colors opacity-0 group-hover:opacity-100 text-xs"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Done items */}
      {done.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-stone-300 mb-3">Completate</p>
          <ul className="space-y-2">
            {done.map(t => (
              <li key={t.id} className="flex items-center gap-3 group py-2 border-b border-stone-50">
                <button
                  onClick={() => startTransition(() => toggleTodo(t.id))}
                  disabled={isPending}
                  className="w-4 h-4 rounded-full bg-stone-200 disabled:opacity-40 flex-shrink-0"
                />
                <span className="flex-1 text-sm text-stone-400 line-through">{t.text}</span>
                <button
                  onClick={() => startTransition(() => deleteTodo(t.id))}
                  disabled={isPending}
                  className="text-stone-200 hover:text-red-400 disabled:opacity-40 transition-colors opacity-0 group-hover:opacity-100 text-xs"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {todos.length === 0 && (
        <p className="text-sm text-stone-300 text-center py-12">Niente ancora. Aggiungila sopra.</p>
      )}

    </main>
  )
}
