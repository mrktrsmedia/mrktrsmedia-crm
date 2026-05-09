import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Topbar } from '@/components/layout/topbar'
import { OnboardingChecklist } from '@/components/clients/onboarding-checklist'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Onboarding' }

export default async function OnboardingPage({ params }: { params: { clientId: string } }) {
  const sb = createClient()
  const [{ data: client }, { data: form }] = await Promise.all([
    sb.from('clients').select('id,retainer_amount,status,med_spa:med_spas(id,name,city)').eq('id', params.clientId).single(),
    sb.from('onboarding_forms').select('*').eq('client_id', params.clientId).single(),
  ])
  if (!client) notFound()

  const spa = (client as any).med_spa

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Topbar
        title={`Onboarding — ${spa?.name ?? 'Client'}`}
        subtitle="Click any item to toggle its completion status"
        actions={<Link href={`/clients/${client.id}`}><button className="btn-ghost btn-sm">← Back to Client</button></Link>}
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', maxWidth: 640 }}>
        <OnboardingChecklist clientId={client.id} form={form as any} />
      </div>
    </div>
  )
}
