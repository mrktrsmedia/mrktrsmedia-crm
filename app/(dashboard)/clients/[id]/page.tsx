import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Topbar } from '@/components/layout/topbar'
import { OnboardingChecklist, OB_ALL_ITEMS } from '@/components/clients/onboarding-checklist'
import { AddNoteForm } from '@/components/shared/add-note-form'
import { MarkPaidBtn } from '@/components/shared/mark-paid-btn'
import Link from 'next/link'
import { SERVICE_PACKAGES, UPSELL_SERVICES } from '@/lib/constants'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const sb = createClient()
  const { data } = await sb.from('clients').select('med_spa:med_spas(name)').eq('id',params.id).single()
  return { title: (data?.med_spa as any)?.name??'Client' }
}

const fmt = (n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:0}).format(n)
const fds = (d:string|null)=>d?new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'—'

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const sb = createClient()
  const [
    { data: client },
    { data: onboarding },
    { data: payments },
    { data: notes },
    { data: activity },
  ] = await Promise.all([
    sb.from('clients').select('*,med_spa:med_spas(id,name,city,state,instagram_handle,website),primary_contact:contacts(name,email,phone),account_manager:users!clients_account_manager_id_fkey(full_name)').eq('id',params.id).single(),
    sb.from('onboarding_forms').select('*').eq('client_id',params.id).single(),
    sb.from('payments').select('*').eq('client_id',params.id).order('created_at',{ascending:false}),
    sb.from('notes').select('*,author:users(full_name)').eq('client_id',params.id).order('created_at',{ascending:false}).limit(10),
    sb.from('activity_timeline').select('*,author:users(full_name)').eq('client_id',params.id).order('created_at',{ascending:false}).limit(10),
  ])
  if (!client) notFound()

  const spa     = (client as any).med_spa
  const contact = (client as any).primary_contact
  const am      = (client as any).account_manager

  const collected = payments?.filter(p=>p.status==='paid').reduce((s,p)=>s+(p.amount??0),0)??0
  const pending_  = payments?.filter(p=>p.status==='pending').reduce((s,p)=>s+(p.amount??0),0)??0
  const overdue_  = payments?.filter(p=>p.status==='overdue').reduce((s,p)=>s+(p.amount??0),0)??0

  const obDone = OB_ALL_ITEMS.filter(i=>(onboarding as any)?.[i.key]===true).length
  const obPct  = Math.round(obDone/OB_ALL_ITEMS.length*100)

  const EMOJI: Record<string,string> = { email:'📤',payment:'💰',onboarding:'📋',note:'📝',stage_change:'→' }

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100vh' }}>
      <Topbar
        title={spa?.name??'Client'}
        subtitle="Client Record"
        actions={
          <div style={{ display:'flex',gap:8 }}>
            <Link href="/clients"><button className="btn-ghost btn-sm">← Back</button></Link>
            <Link href={`/onboarding/${client.id}`}><button className="btn-ghost btn-sm">Onboarding</button></Link>
          </div>
        }
      />

      <div style={{ flex:1,display:'grid',gridTemplateColumns:'230px 1fr',overflow:'hidden' }}>

        {/* LEFT */}
        <div style={{ borderRight:'1px solid var(--border)',overflowY:'auto',padding:14,display:'flex',flexDirection:'column',gap:12 }}>

          <div style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,padding:14 }}>
            <div className="avatar" style={{ width:44,height:44,fontSize:16,fontWeight:700,marginBottom:10 }}>{spa?.name?.slice(0,2).toUpperCase()}</div>
            <div style={{ fontWeight:700,fontSize:14,color:'var(--t1)',lineHeight:1.3 }}>{spa?.name}</div>
            <div style={{ fontSize:11,color:'var(--t3)',marginTop:3,marginBottom:8 }}>{client.service_package}</div>
            <div style={{ display:'flex',gap:5,flexWrap:'wrap' }}>
              <span className={`badge b-${client.status}`}>{client.status}</span>
              <span className={`badge b-${(client.onboarding_status??'not_started').replace(/ /g,'_')}`}>{client.onboarding_status?.replace(/_/g,' ')??'Not Started'}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize:9,fontWeight:600,letterSpacing:'1.2px',textTransform:'uppercase',color:'var(--t4)',marginBottom:8 }}>Financials</div>
            <div className="kv"><span className="kv-k">Retainer</span><span className="kv-v gold">{fmt(client.retainer_amount??0)}/mo</span></div>
            <div className="kv"><span className="kv-k">Setup Fee</span><span className="kv-v">{fmt(client.setup_fee??0)}</span></div>
            <div className="kv"><span className="kv-k">Collected</span><span className="kv-v" style={{ color:'var(--green)' }}>{fmt(collected)}</span></div>
            <div className="kv"><span className="kv-k">Pending</span><span className="kv-v" style={{ color:pending_>0?'var(--amber)':'var(--t1)' }}>{fmt(pending_)}</span></div>
            {overdue_>0&&<div className="kv"><span className="kv-k">Overdue</span><span className="kv-v" style={{ color:'var(--red)' }}>{fmt(overdue_)}</span></div>}
          </div>

          <div className="divider"/>
          <div>
            <div style={{ fontSize:9,fontWeight:600,letterSpacing:'1.2px',textTransform:'uppercase',color:'var(--t4)',marginBottom:8 }}>Details</div>
            <div className="kv"><span className="kv-k">Start Date</span><span style={{ fontSize:11,color:'var(--t2)' }}>{fds(client.start_date)}</span></div>
            <div className="kv"><span className="kv-k">Account Manager</span><span style={{ fontSize:11,color:'var(--t2)' }}>{am?.full_name??'—'}</span></div>
            {client.primary_goal&&<div style={{ fontSize:11,color:'var(--t3)',marginTop:6,lineHeight:1.5 }}><span style={{ color:'var(--t4)' }}>Goal: </span>{client.primary_goal}</div>}
          </div>

          {contact && (
            <>
              <div className="divider"/>
              <div>
                <div style={{ fontSize:9,fontWeight:600,letterSpacing:'1.2px',textTransform:'uppercase',color:'var(--t4)',marginBottom:8 }}>Primary Contact</div>
                <div style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:6,padding:10 }}>
                  <div style={{ fontSize:12,fontWeight:600,color:'var(--t1)' }}>{contact.name}</div>
                  {contact.email&&<a href={`mailto:${contact.email}`} style={{ display:'block',fontSize:11,color:'var(--blue)',marginTop:4 }}>{contact.email}</a>}
                  {contact.phone&&<div style={{ fontSize:11,color:'var(--t3)',marginTop:2 }}>{contact.phone}</div>}
                </div>
              </div>
            </>
          )}

          {/* Services */}
          <div className="divider"/>
          <div>
            <div style={{ fontSize:9,fontWeight:600,letterSpacing:'1.2px',textTransform:'uppercase',color:'var(--t4)',marginBottom:8 }}>Services</div>
            {SERVICE_PACKAGES[0].includes.map((s,i)=>(
              <div key={i} style={{ fontSize:10,color:'var(--green)',marginBottom:3 }}>✓ {s.name}</div>
            ))}
            {UPSELL_SERVICES.map(s=>{
              const hasIt = client.service_package?.toLowerCase().includes(s.id.toLowerCase())
              return hasIt ? <div key={s.id} style={{ fontSize:10,color:'var(--gold)',marginBottom:3 }}>+ {s.name}</div> : null
            })}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ overflowY:'auto',padding:14,display:'flex',flexDirection:'column',gap:10 }}>

          {/* Finance summary */}
          <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8 }}>
            {[
              { l:'Retainer',  v:fmt(client.retainer_amount??0), gold:true },
              { l:'Collected', v:fmt(collected),                  green:true },
              { l:'Pending',   v:fmt(pending_) },
              { l:'Onboarding',v:`${obPct}%`,  gold:true },
            ].map(s=>(
              <div key={s.l} className={`metric${s.gold?' m-gold':s.green?' m-green':''}`}>
                <span className="metric-lbl">{s.l}</span>
                <span className="metric-val" style={{ fontSize:18,color:s.gold?'var(--gold)':s.green?'var(--green)':'var(--t1)' }}>{s.v}</span>
              </div>
            ))}
          </div>

          {/* Onboarding checklist */}
          <div>
            <div style={{ marginBottom:8 }}>
              <span className="sec-lbl">Onboarding Checklist</span>
              <span style={{ fontSize:10,color:'var(--t3)',marginLeft:8 }}>Click any item to toggle</span>
            </div>
            <OnboardingChecklist clientId={client.id} form={onboarding as any} />
          </div>

          {/* Payments */}
          <div className="card">
            <div className="card-hd">
              <div className="card-title">Payments</div>
            </div>
            {(payments?.length??0)===0&&<div style={{ padding:'14px',fontSize:12,color:'var(--t4)' }}>No payments yet. Payment records are created automatically when you create the client.</div>}
            <table className="tbl">
              <thead>
                <tr><th>Type</th><th style={{ textAlign:'right' }}>Amount</th><th>Status</th><th>Due</th><th>Paid</th><th></th></tr>
              </thead>
              <tbody>
                {payments?.map((p:any)=>(
                  <tr key={p.id}>
                    <td style={{ textTransform:'capitalize' }}>{p.payment_type?.replace(/_/g,' ')}</td>
                    <td className="num" style={{ fontWeight:600,color:p.status==='paid'?'var(--green)':p.status==='overdue'?'var(--red)':'var(--amber)' }}>{fmt(p.amount??0)}</td>
                    <td><span className={`badge b-${p.status}`}>{p.status}</span></td>
                    <td style={{ fontSize:11,color:'var(--t3)',fontFamily:'monospace' }}>{fds(p.due_date)}</td>
                    <td style={{ fontSize:11,color:'var(--t3)',fontFamily:'monospace' }}>{fds(p.paid_date)}</td>
                    <td>{p.status!=='paid'&&<MarkPaidBtn paymentId={p.id} clientId={client.id}/>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          <div className="card">
            <div className="card-hd">
              <div className="card-title">Notes</div>
              <AddNoteForm clientId={client.id} />
            </div>
            {(notes?.length??0)===0&&<div style={{ padding:'14px',fontSize:12,color:'var(--t4)' }}>No notes yet.</div>}
            {notes?.map((n:any)=>(
              <div key={n.id} style={{ padding:'10px 14px',borderBottom:'1px solid var(--border)' }}>
                <p style={{ fontSize:12,color:'var(--t1)',lineHeight:1.6,margin:0 }}>{n.body}</p>
                <div style={{ fontSize:10,color:'var(--t3)',marginTop:5 }}>{n.author?.full_name} · {fds(n.created_at)}</div>
              </div>
            ))}
          </div>

          {/* Activity */}
          <div className="card">
            <div className="card-hd"><div className="card-title">Activity Timeline</div></div>
            {(activity?.length??0)===0&&<div style={{ padding:'14px',fontSize:12,color:'var(--t4)' }}>No activity yet.</div>}
            {activity?.map((a:any)=>(
              <div key={a.id} style={{ display:'flex',gap:8,padding:'9px 14px',borderBottom:'1px solid var(--border)' }}>
                <div className="tl-bubble" style={{ fontSize:12 }}>{EMOJI[a.activity_type]??'•'}</div>
                <div>
                  <div style={{ fontSize:11,fontWeight:500,color:'var(--t1)' }}>{a.title}</div>
                  {a.description&&<div style={{ fontSize:10,color:'var(--t2)',marginTop:2 }}>{a.description}</div>}
                  <div style={{ fontSize:10,color:'var(--t3)',marginTop:3 }}>{a.author?.full_name} · {fds(a.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
