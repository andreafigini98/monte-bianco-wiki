'use server'
import { revalidatePath } from 'next/cache'
import { getTodos, saveTodos } from '@/lib/todos'

export async function addTodo(text: string) {
  const todos = await getTodos()
  todos.unshift({ id: crypto.randomUUID(), text, done: false })
  await saveTodos(todos)
  revalidatePath('/segreto')
}

export async function toggleTodo(id: string) {
  const todos = await getTodos()
  const todo = todos.find(t => t.id === id)
  if (todo) todo.done = !todo.done
  await saveTodos(todos)
  revalidatePath('/segreto')
}

export async function deleteTodo(id: string) {
  const todos = (await getTodos()).filter(t => t.id !== id)
  await saveTodos(todos)
  revalidatePath('/segreto')
}
