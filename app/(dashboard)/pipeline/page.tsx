import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import { PipelineBoard } from '@/components/pipeline/pipeline-board'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Pipeline' }

export default async function PipelinePage() {
  const sb = createClient()
  const { data: spas } = await sb
    .from('med_spas')
    .select('id,name,city,state,pipeline_stage,lead_quality,estimated_retainer_value,is_hot_lead,last_contacted_at')
    .eq('is_archived', false)
    .order('lead_quality_score', { ascending: false })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Topbar
        title="Pipeline"
        subtitle={`${spas?.length ?? 0} prospects`}
        actions={<Link href="/med-spas/new"><button className="btn-gold btn-sm">+ Add Lead</button></Link>}
      />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <PipelineBoard initialSpas={spas ?? []} />
      </div>
    </div>
  )
}
