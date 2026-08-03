import { kv } from '@vercel/kv'

export type Todo = { id: string; text: string; done: boolean }

const KEY = 'wiki-todos'

export async function getTodos(): Promise<Todo[]> {
  return (await kv.get<Todo[]>(KEY)) ?? []
}

export async function saveTodos(todos: Todo[]): Promise<void> {
  await kv.set(KEY, todos)
}
