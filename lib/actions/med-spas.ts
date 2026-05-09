'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createMedSpa(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const insertData = {
    name:                     formData.get('name') as string,
    website:                  (formData.get('website') as string) || null,
    instagram_handle:         (formData.get('instagram_handle') as string) || null,
    facebook_url:             (formData.get('facebook_url') as string) || null,
    city:                     (formData.get('city') as string) || null,
    state:                    (formData.get('state') as string) || null,
    niche_focus:              (formData.get('niche_focus') as string) || null,
    estimated_offer_level:    (formData.get('estimated_offer_level') as string) || 'mid_ticket',
    estimated_retainer_value: formData.get('estimated_retainer_value') ? Number(formData.get('estimated_retainer_value')) : null,
    lead_quality_score:       formData.get('lead_quality_score') ? Number(formData.get('lead_quality_score')) : null,
    lead_quality:             (formData.get('lead_quality') as string) || 'unscored',
    ad_status:                (formData.get('ad_status') as string) || 'unknown',
    source_of_lead:           (formData.get('source_of_lead') as string) || null,
    website_quality_notes:    (formData.get('website_quality_notes') as string) || null,
    instagram_quality_notes:  (formData.get('instagram_quality_notes') as string) || null,
    is_hot_lead:              formData.get('is_hot_lead') === 'on',
    pipeline_stage:           'new_lead',
    status:                   'lead',
    created_by:               user.id,
  }

  const { data: spa, error } = await supabase
    .from('med_spas')
    .insert(insertData)
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/med-spas')
  revalidatePath('/dashboard')
  redirect(`/med-spas/${spa.id}`)
}

export async function updateMedSpa(id: string, updates: Record<string, any>) {
  const supabase = createClient()
  const { error } = await supabase
    .from('med_spas')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/med-spas')
  revalidatePath(`/med-spas/${id}`)
}

export async function updateMedSpaStage(id: string, stage: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('med_spas')
    .update({ pipeline_stage: stage, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  if (user) {
    await supabase.from('activity_timeline').insert({
      med_spa_id: id,
      activity_type: 'stage_change',
      title: `Stage changed to ${stage.replace(/_/g, ' ')}`,
      created_by: user.id,
    }).then(() => {})
  }
  revalidatePath('/pipeline')
  revalidatePath(`/med-spas/${id}`)
}

export async function addNote(medSpaId: string, body: string, noteType = 'general') {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('notes').insert({
    med_spa_id: medSpaId,
    body,
    note_type: noteType,
    is_pinned: false,
    created_by: user.id,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/med-spas/${medSpaId}`)
}

export async function logOutreach(data: {
  med_spa_id: string
  channel: string
  outreach_stage: string
  message_type?: string
  message_summary?: string
  response_summary?: string
  media_seen: boolean
  replied: boolean
  calendly_sent: boolean
  call_booked: boolean
  next_follow_up_date?: string
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('outreach_logs').insert({
    med_spa_id:          data.med_spa_id,
    channel:             data.channel,
    outreach_stage:      data.outreach_stage,
    message_type:        data.message_type || 'text',
    message_summary:     data.message_summary || null,
    response_summary:    data.response_summary || null,
    media_seen:          data.media_seen,
    replied:             data.replied,
    calendly_sent:       data.calendly_sent,
    call_booked:         data.call_booked,
    outreach_date:       new Date().toISOString(),
    next_follow_up_date: data.next_follow_up_date || null,
    created_by:          user.id,
  })
  if (error) throw new Error(error.message)

  if (data.next_follow_up_date) {
    await supabase.from('med_spas').update({
      next_follow_up_date: data.next_follow_up_date,
      last_contacted_at:   new Date().toISOString(),
      updated_at:          new Date().toISOString(),
    }).eq('id', data.med_spa_id)
  } else {
    await supabase.from('med_spas').update({
      last_contacted_at: new Date().toISOString(),
      updated_at:        new Date().toISOString(),
    }).eq('id', data.med_spa_id)
  }

  revalidatePath(`/med-spas/${data.med_spa_id}`)
  revalidatePath('/outreach')
  revalidatePath('/dashboard')
}
