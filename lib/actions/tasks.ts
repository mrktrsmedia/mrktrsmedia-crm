'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTask(data: {
  title: string
  task_type: string
  priority: string
  med_spa_id?: string | null
  client_id?: string | null
  due_date?: string | null
  description?: string | null
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('tasks').insert({
    ...data,
    status: 'pending',
    assigned_to: user.id,
    created_by: user.id,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/tasks')
  revalidatePath('/dashboard')
  if (data.med_spa_id) revalidatePath(`/med-spas/${data.med_spa_id}`)
  if (data.client_id)  revalidatePath(`/clients/${data.client_id}`)
}

export async function completeTask(taskId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('tasks').update({
    status: 'completed',
    completed_at: new Date().toISOString(),
    updated_at:   new Date().toISOString(),
  }).eq('id', taskId)
  if (error) throw new Error(error.message)
  revalidatePath('/tasks')
  revalidatePath('/dashboard')
}

export async function deleteTask(taskId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) throw new Error(error.message)
  revalidatePath('/tasks')
}
