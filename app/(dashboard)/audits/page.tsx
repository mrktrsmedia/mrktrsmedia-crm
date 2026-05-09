import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import Link from 'next/link'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Audits' }

export default async function AuditsPage() {
  const sb = createClient()
  const { data: spas } = await sb.from('med_spas').select('id,name,website_quality_notes,instagram_quality_notes,ad_status,lead_quality,estimated_retainer_value').not('website_quality_notes','is',null).order('created_at',{ascending:false}).limit(100)
  const fmt = (n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:0}).format(n)
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh'}}>
      <Topbar title="Audits" subtitle="Med spa research & scoring notes" />
      <div style={{flex:1,overflowY:'auto'}}>
        <table className="tbl">
          <thead><tr><th>Med Spa</th><th>Lead Quality</th><th>Ad Status</th><th>Website Notes</th><th>Instagram Notes</th><th style={{textAlign:'right'}}>Est. Value</th><th></th></tr></thead>
          <tbody>
            {(spas??[]).map((s:any)=>(
              <tr key={s.id}>
                <td style={{fontWeight:500,color:'var(--t1)'}}>{s.name}</td>
                <td><span className={`badge b-${s.lead_quality}`}>{s.lead_quality}</span></td>
                <td style={{fontSize:11,color:'var(--t2)',textTransform:'capitalize'}}>{s.ad_status?.replace(/_/g,' ')}</td>
                <td style={{fontSize:11,color:'var(--t2)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.website_quality_notes??'—'}</td>
                <td style={{fontSize:11,color:'var(--t2)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.instagram_quality_notes??'—'}</td>
                <td className="num" style={{color:'var(--gold)',fontWeight:600}}>{s.estimated_retainer_value?fmt(s.estimated_retainer_value):'—'}</td>
                <td><Link href={`/med-spas/${s.id}`}><button className="btn-icon" style={{fontSize:11}}>↗</button></Link></td>
              </tr>
            ))}
            {(spas?.length??0)===0&&<tr><td colSpan={7} style={{textAlign:'center',padding:32,color:'var(--t4)'}}>No audits yet. Add website/Instagram notes when adding a med spa.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
