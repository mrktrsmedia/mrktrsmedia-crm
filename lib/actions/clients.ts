'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createClientRecord(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const med_spa_id          = formData.get('med_spa_id') as string
  const retainer_amount     = Number(formData.get('retainer_amount'))
  const setup_fee           = Number(formData.get('setup_fee') || 0)
  const service_package     = formData.get('service_package') as string
  const start_date          = formData.get('start_date') as string
  const primary_contact_id  = (formData.get('primary_contact_id') as string) || null
  const account_manager_id  = (formData.get('account_manager_id') as string) || user.id
  const primary_goal        = (formData.get('primary_goal') as string) || null
  const addons              = formData.getAll('addons') as string[]

  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      med_spa_id,
      primary_contact_id,
      account_manager_id,
      retainer_amount,
      setup_fee,
      service_package,
      start_date,
      primary_goal,
      status: 'active',
      onboarding_status: 'not_started',
      currency: 'USD',
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  // Update med spa → client status
  await supabase.from('med_spas').update({
    status: 'client',
    pipeline_stage: 'won',
    updated_at: new Date().toISOString(),
  }).eq('id', med_spa_id)

  // Create onboarding form row
  await supabase.from('onboarding_forms').insert({ client_id: client.id })

  // Create initial payment record for setup fee if > 0
  if (setup_fee > 0) {
    await supabase.from('payments').insert({
      client_id: client.id,
      med_spa_id,
      payment_type: 'setup_fee',
      amount: setup_fee,
      status: 'pending',
      due_date: start_date,
      created_by: user.id,
    })
  }

  // Create first retainer payment
  await supabase.from('payments').insert({
    client_id: client.id,
    med_spa_id,
    payment_type: 'retainer',
    amount: retainer_amount,
    status: 'pending',
    due_date: start_date,
    created_by: user.id,
  })

  // Log activity
  await supabase.from('activity_timeline').insert({
    client_id: client.id,
    med_spa_id,
    activity_type: 'onboarding',
    title: 'Client account created',
    description: `Package: ${service_package}${addons.length ? ' + ' + addons.join(', ') : ''}`,
    created_by: user.id,
  })

  revalidatePath('/clients')
  revalidatePath('/dashboard')
  redirect(`/clients/${client.id}`)
}

export async function toggleOnboardingItem(clientId: string, field: string, value: boolean) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Upsert onboarding form
  const { error } = await supabase
    .from('onboarding_forms')
    .upsert({ client_id: clientId, [field]: value, updated_at: new Date().toISOString() })

  if (error) {
    // If upsert fails because row doesn't exist, try insert
    const { error: e2 } = await supabase.from('onboarding_forms').insert({ client_id: clientId, [field]: value })
    if (e2) throw new Error(e2.message)
  }

  // Check if all items done and update onboarding_status
  const { data: form } = await supabase.from('onboarding_forms').select('*').eq('client_id', clientId).single()
  if (form) {
    const boolFields = Object.entries(form).filter(([k, v]) => typeof v === 'boolean')
    const allDone = boolFields.every(([, v]) => v === true)
    const anyDone = boolFields.some(([, v]) => v === true)
    const status = allDone ? 'completed' : anyDone ? 'in_progress' : 'not_started'
    await supabase.from('clients').update({ onboarding_status: status, updated_at: new Date().toISOString() }).eq('id', clientId)
  }

  revalidatePath(`/clients/${clientId}`)
  revalidatePath(`/onboarding/${clientId}`)
}

export async function recordPayment(data: {
  client_id: string
  med_spa_id: string
  payment_type: string
  amount: number
  status: string
  due_date?: string
  notes?: string
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('payments').insert({ ...data, created_by: user.id })
  if (error) throw new Error(error.message)
  revalidatePath(`/clients/${data.client_id}`)
  revalidatePath('/payments')
  revalidatePath('/finance')
}

export async function markPaymentPaid(paymentId: string, clientId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('payments').update({
    status: 'paid',
    paid_date: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString(),
  }).eq('id', paymentId)
  if (error) throw new Error(error.message)
  revalidatePath(`/clients/${clientId}`)
  revalidatePath('/payments')
  revalidatePath('/finance')
}

export async function addClientNote(clientId: string, body: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('notes').insert({
    client_id: clientId, body, note_type: 'general', is_pinned: false, created_by: user.id,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/clients/${clientId}`)
}
