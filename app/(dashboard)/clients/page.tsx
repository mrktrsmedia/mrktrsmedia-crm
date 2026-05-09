import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Clients' }
const fmt = (n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:0}).format(n)

export default async function ClientsPage() {
  const sb = createClient()
  const { data: clients } = await sb
    .from('clients')
    .select('*,med_spa:med_spas(name,city,state),primary_contact:contacts(name),account_manager:users!clients_account_manager_id_fkey(full_name)')
    .order('created_at',{ascending:false})

  const active  = clients?.filter(c=>c.status==='active')??[]
  const mrr     = active.reduce((s,c)=>s+(c.retainer_amount??0),0)
  const paused  = clients?.filter(c=>c.status==='paused').length??0
  const churned = clients?.filter(c=>c.status==='churned').length??0

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100vh' }}>
      <Topbar
        title="Clients"
        subtitle={`${clients?.length??0} total · ${active.length} active`}
        actions={<Link href="/clients/new"><button className="btn-gold btn-sm">+ New Client</button></Link>}
      />

      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,padding:'12px 20px',borderBottom:'1px solid var(--border)',flexShrink:0 }}>
        {[
          { l:'Active Clients',v:active.length,gold:true },
          { l:'MRR',           v:fmt(mrr),     gold:true },
          { l:'Paused',        v:paused },
          { l:'Churned',       v:churned },
        ].map(s=>(
          <div key={s.l} className={`metric${s.gold?' m-gold':''}`}>
            <span className="metric-lbl">{s.l}</span>
            <span className="metric-val" style={{ fontSize:18,color:s.gold?'var(--gold)':'var(--t1)' }}>{s.v}</span>
          </div>
        ))}
      </div>

      <div style={{ flex:1,overflowY:'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Client</th><th>Package</th>
              <th style={{ textAlign:'right' }}>Retainer</th>
              <th>Status</th><th>Onboarding</th>
              <th>Start Date</th><th>Account Manager</th><th></th>
            </tr>
          </thead>
          <tbody>
            {(clients??[]).map((c:any)=>(
              <tr key={c.id}>
                <td>
                  <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                    <div className="avatar" style={{ width:30,height:30,fontSize:9,fontWeight:700 }}>
                      {c.med_spa?.name?.slice(0,2).toUpperCase()??'??'}
                    </div>
                    <div>
                      <div style={{ fontWeight:500,color:'var(--t1)',fontSize:12 }}>{c.med_spa?.name??'—'}</div>
                      <div style={{ fontSize:10,color:'var(--t3)' }}>{c.med_spa?.city}{c.med_spa?.state?`, ${c.med_spa.state}`:''}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize:11,color:'var(--t2)',maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{c.service_package??'—'}</td>
                <td style={{ textAlign:'right',fontFamily:'monospace',fontSize:12,fontWeight:600,color:'var(--gold)' }}>{c.retainer_amount?fmt(c.retainer_amount):'—'}</td>
                <td><span className={`badge b-${c.status}`}>{c.status}</span></td>
                <td><span className={`badge b-${(c.onboarding_status??'not_started').replace(' ','_')}`}>{c.onboarding_status?.replace(/_/g,' ')??'Not Started'}</span></td>
                <td style={{ fontSize:11,color:'var(--t3)',fontFamily:'monospace' }}>
                  {c.start_date?new Date(c.start_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'—'}
                </td>
                <td style={{ fontSize:11,color:'var(--t2)' }}>{c.account_manager?.full_name??'—'}</td>
                <td>
                  <Link href={`/clients/${c.id}`}><button className="btn-icon" style={{ fontSize:11 }}>↗</button></Link>
                </td>
              </tr>
            ))}
            {(clients?.length??0)===0&&<tr><td colSpan={8} style={{ textAlign:'center',padding:32,color:'var(--t4)' }}>No clients yet. <Link href="/clients/new" style={{ color:'var(--gold)' }}>Create first client →</Link></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
