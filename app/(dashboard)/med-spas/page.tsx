import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Med Spas' }
const fmt = (n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:0}).format(n)

export default async function MedSpasPage({ searchParams }: { searchParams: { status?: string } }) {
  const sb = createClient()
  const status = searchParams.status

  let q = sb.from('med_spas').select('id,name,city,state,niche_focus,status,pipeline_stage,lead_quality,lead_quality_score,is_hot_lead,ad_status,estimated_retainer_value,next_follow_up_date,instagram_handle,website').eq('is_archived',false)
  if (status && status !== 'all') q = q.eq('status',status)
  q = q.order('is_hot_lead',{ascending:false}).order('lead_quality_score',{ascending:false})
  const { data: spas } = await q

  const now = new Date()
  const counts = {
    all:      spas?.length??0,
    lead:     spas?.filter(s=>s.status==='lead').length??0,
    prospect: spas?.filter(s=>s.status==='prospect').length??0,
    booked:   spas?.filter(s=>s.status==='booked').length??0,
    client:   spas?.filter(s=>s.status==='client').length??0,
    lost:     spas?.filter(s=>s.status==='lost').length??0,
  }

  const TABS = [
    { val:'all', label:`All (${counts.all})` },
    { val:'lead', label:`Leads (${counts.lead})` },
    { val:'prospect', label:`Prospects (${counts.prospect})` },
    { val:'booked', label:`Booked (${counts.booked})` },
    { val:'client', label:`Clients (${counts.client})` },
    { val:'lost', label:`Lost (${counts.lost})` },
  ]

  const QCOLOR: Record<string,string> = { hot:'b-hot',high:'b-high',medium:'b-medium',low:'b-low',unscored:'b-unscored' }

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100vh' }}>
      <Topbar
        title="Med Spas"
        subtitle={`${spas?.length??0} records`}
        actions={
          <div style={{ display:'flex',gap:8 }}>
            <Link href="/med-spas/new"><button className="btn-gold btn-sm">+ Add Med Spa</button></Link>
          </div>
        }
      />

      <div style={{ display:'flex',alignItems:'center',gap:4,padding:'10px 20px',borderBottom:'1px solid var(--border)',flexShrink:0,background:'var(--ink3)' }}>
        {TABS.map(t=>(
          <Link key={t.val} href={`/med-spas?status=${t.val}`} style={{ textDecoration:'none' }}>
            <button className={`ftab${!status&&t.val==='all'||status===t.val?' on':''}`}>{t.label}</button>
          </Link>
        ))}
      </div>

      <div style={{ flex:1,overflowY:'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Med Spa</th>
              <th>Location</th>
              <th>Status</th>
              <th>Stage</th>
              <th>Quality</th>
              <th>Ads</th>
              <th style={{ textAlign:'right' }}>Est. Retainer</th>
              <th>Follow-up</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(spas??[]).map((spa:any)=>{
              const fuDate = spa.next_follow_up_date ? new Date(spa.next_follow_up_date) : null
              const isOv = fuDate && fuDate < now
              return (
                <tr key={spa.id}>
                  <td>
                    <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                      <div className="avatar" style={{ width:30,height:30,fontSize:10,fontWeight:700,flexShrink:0 }}>{spa.name.slice(0,2).toUpperCase()}</div>
                      <div>
                        <div style={{ display:'flex',alignItems:'center',gap:5 }}>
                          <span style={{ fontSize:12,fontWeight:500,color:'var(--t1)' }}>{spa.name}</span>
                          {spa.is_hot_lead && <span className="hot-badge">🔥 HOT</span>}
                        </div>
                        <div style={{ fontSize:10,color:'var(--t3)',marginTop:1 }}>{spa.niche_focus}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize:11 }}>{spa.city}{spa.state?`, ${spa.state}`:''}</td>
                  <td><span className={`badge b-${spa.status}`}>{spa.status==='booked'?'Call Booked':spa.status}</span></td>
                  <td style={{ fontSize:11,color:'var(--t2)',textTransform:'capitalize' }}>{spa.pipeline_stage?.replace(/_/g,' ')}</td>
                  <td>
                    <div style={{ display:'flex',alignItems:'center',gap:5 }}>
                      <span className={`badge ${QCOLOR[spa.lead_quality]??'b-unscored'}`}>{spa.lead_quality==='hot'?'Hot 🔥':spa.lead_quality??'—'}</span>
                      {spa.lead_quality_score && <span className="score score-mid">{spa.lead_quality_score}/10</span>}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize:10,padding:'2px 6px',borderRadius:4,background:spa.ad_status==='running_ads'?'var(--green-dim)':spa.ad_status==='weak_ads'?'var(--amber-dim)':'var(--surface2)',color:spa.ad_status==='running_ads'?'var(--green)':spa.ad_status==='weak_ads'?'var(--amber)':'var(--t3)' }}>
                      {spa.ad_status==='running_ads'?'Running':spa.ad_status==='not_running_ads'?'No Ads':spa.ad_status==='weak_ads'?'Weak Ads':'Unknown'}
                    </span>
                  </td>
                  <td style={{ textAlign:'right',fontFamily:'monospace',fontSize:12,fontWeight:600,color:'var(--gold)' }}>
                    {spa.estimated_retainer_value?fmt(spa.estimated_retainer_value):'—'}
                  </td>
                  <td style={{ fontFamily:'monospace',fontSize:11,color:isOv?'var(--red)':'var(--t3)',fontWeight:isOv?600:undefined }}>
                    {fuDate ? `${fuDate.toLocaleDateString('en-US',{month:'short',day:'numeric'})}${isOv?' ⚠':''}` : '—'}
                  </td>
                  <td>
                    <Link href={`/med-spas/${spa.id}`}><button className="btn-icon" style={{ fontSize:11 }}>↗</button></Link>
                  </td>
                </tr>
              )
            })}
            {(spas?.length??0)===0 && (
              <tr><td colSpan={9} style={{ textAlign:'center',padding:32,color:'var(--t4)' }}>
                No med spas yet. <Link href="/med-spas/new" style={{ color:'var(--gold)' }}>Add your first lead →</Link>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
