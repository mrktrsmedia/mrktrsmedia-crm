import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }
export const revalidate = 30

const fmt = (n: number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:0}).format(n)
const fds = (d: string) => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'})

export default async function DashboardPage() {
  const sb  = createClient()
  const now = new Date()
  const in3  = new Date(now.getTime()+3*86400000).toISOString()

  const [
    { data: spas },
    { data: clients },
    { data: payments },
    { data: overdue },
    { data: tasks },
    { data: hotLeads },
    { data: recentLogs },
    { data: activity },
  ] = await Promise.all([
    sb.from('med_spas').select('id,status,is_hot_lead').eq('is_archived',false),
    sb.from('clients').select('id,retainer_amount,status,med_spa:med_spas(name)').eq('status','active'),
    sb.from('payments').select('id,amount,status,payment_type,client:clients(med_spa:med_spas(name))').order('created_at',{ascending:false}).limit(5),
    sb.from('med_spas').select('id,name,city,state,next_follow_up_date').eq('is_archived',false).lt('next_follow_up_date',now.toISOString()).not('next_follow_up_date','is',null).order('next_follow_up_date').limit(5),
    sb.from('tasks').select('id,title,task_type,priority,due_date,med_spa:med_spas(name)').in('status',['pending','in_progress']).lte('due_date',in3).order('due_date').limit(6),
    sb.from('med_spas').select('id,name,city,state,estimated_retainer_value,lead_quality').eq('is_hot_lead',true).eq('is_archived',false).limit(5),
    sb.from('outreach_logs').select('id,channel,outreach_stage,outreach_date,med_spa:med_spas(name)').order('outreach_date',{ascending:false}).limit(5),
    sb.from('activity_timeline').select('id,title,activity_type,created_at,author:users(full_name)').order('created_at',{ascending:false}).limit(6),
  ])

  const mrr      = clients?.reduce((s,c)=>s+(c.retainer_amount??0),0)??0
  const total    = spas?.length??0
  const hot      = spas?.filter(s=>s.is_hot_lead).length??0
  const active   = clients?.length??0
  const overdue_ = overdue?.length??0
  const pPaid    = payments?.filter(p=>p.status==='paid').reduce((s,p)=>s+(p.amount??0),0)??0
  const pOverdue = payments?.filter(p=>p.status==='overdue').reduce((s,p)=>s+(p.amount??0),0)??0

  const DOT: Record<string,string> = { urgent:'var(--red)', high:'var(--amber)', medium:'var(--blue)', low:'var(--t4)' }
  const EMOJI: Record<string,string> = { email:'📤', outreach:'💬', stage_change:'→', payment:'💰', onboarding:'📋', note:'📝' }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh' }}>
      <Topbar
        title="Dashboard"
        subtitle={now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}
        actions={
          <Link href="/med-spas/new">
            <button className="btn-gold btn-sm">+ Add Med Spa</button>
          </Link>
        }
      />

      <div style={{ flex:1, overflowY:'auto', padding:'14px 20px', display:'flex', flexDirection:'column', gap:12 }}>

        {/* Overdue alert */}
        {overdue_>0 && (
          <div className="alert-red">
            <div style={{ width:6,height:6,borderRadius:'50%',background:'var(--red)',flexShrink:0 }}/>
            <span><strong>{overdue_} overdue follow-up{overdue_>1?'s':''}</strong> need attention</span>
            <Link href="/med-spas" style={{ marginLeft:'auto',color:'var(--red)',fontSize:11,fontWeight:500 }}>View →</Link>
          </div>
        )}

        {/* KPI row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8 }}>
          {[
            { l:'Total Leads',   v:total,   accent:'none' },
            { l:'Hot Leads',     v:hot,     accent:'red' },
            { l:'Overdue F/U',   v:overdue_,accent: overdue_>0 ? 'red':'none' },
            { l:'Active Clients',v:active,  accent:'gold' },
            { l:'MRR',           v:fmt(mrr),accent:'gold' },
            { l:'Overdue PMT',   v:fmt(pOverdue), accent: pOverdue>0?'red':'none' },
          ].map(s=>(
            <div key={s.l} className={`metric${s.accent==='gold'?' m-gold':s.accent==='red'?' m-red':''}`}>
              <span className="metric-lbl">{s.l}</span>
              <span className={`metric-val${s.accent==='gold'?' vg':s.accent==='red'&&(typeof s.v==='number'?s.v>0:s.v!=='$0')?' vred':''}`} style={{ fontSize:18 }}>{s.v}</span>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:12 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>

            {/* Tasks due */}
            <div className="card">
              <div className="card-hd">
                <div className="card-title">Tasks Due Soon</div>
                <Link href="/tasks"><span style={{ fontSize:10, color:'var(--t3)' }}>View all →</span></Link>
              </div>
              {(tasks?.length??0)===0 && <div style={{ padding:'14px',fontSize:12,color:'var(--t4)' }}>No tasks due in the next 3 days.</div>}
              {tasks?.map((t:any)=>{
                const due=t.due_date?new Date(t.due_date):null
                const ov=due&&due<now
                return (
                  <div key={t.id} style={{ display:'flex',alignItems:'center',gap:8,padding:'9px 14px',borderBottom:'1px solid var(--border)',fontSize:11 }}>
                    <div style={{ width:5,height:5,borderRadius:'50%',background:DOT[t.priority]??'var(--t4)',flexShrink:0 }}/>
                    <div style={{ flex:1 }}>
                      <div style={{ color:'var(--t1)',fontWeight:500 }}>{t.title}</div>
                      <div style={{ fontSize:10,color:'var(--t3)',marginTop:1 }}>{t.med_spa?.name} · {t.task_type?.replace(/_/g,' ')}</div>
                    </div>
                    <div style={{ fontSize:10,color:ov?'var(--red)':'var(--t3)',fontWeight:ov?600:undefined,whiteSpace:'nowrap' }}>
                      {due?fds(due.toISOString()):'—'}{ov?' ⚠':''}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Recent outreach */}
            <div className="card">
              <div className="card-hd">
                <div className="card-title">Recent Outreach</div>
                <Link href="/outreach"><span style={{ fontSize:10,color:'var(--t3)' }}>All outreach →</span></Link>
              </div>
              {(recentLogs?.length??0)===0 && <div style={{ padding:'14px',fontSize:12,color:'var(--t4)' }}>No outreach logged yet. <Link href="/outreach" style={{ color:'var(--gold)' }}>Log your first outreach →</Link></div>}
              {recentLogs?.map((l:any)=>(
                <div key={l.id} style={{ display:'flex',alignItems:'center',gap:10,padding:'9px 14px',borderBottom:'1px solid var(--border)',fontSize:11 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:500,color:'var(--t1)' }}>{l.med_spa?.name??'—'}</div>
                    <div style={{ fontSize:10,color:'var(--t3)',marginTop:1,textTransform:'capitalize' }}>
                      {l.channel?.replace(/_/g,' ')} · {l.outreach_stage?.replace(/_/g,' ')}
                    </div>
                  </div>
                  <div style={{ fontSize:10,color:'var(--t3)',fontFamily:'monospace' }}>
                    {l.outreach_date?fds(l.outreach_date):'—'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {/* Hot leads */}
            <div className="card">
              <div className="card-hd">
                <div className="card-title">🔥 Hot Leads</div>
                <Link href="/med-spas"><span style={{ fontSize:10,color:'var(--t3)' }}>All →</span></Link>
              </div>
              {(hotLeads?.length??0)===0 && <div style={{ padding:'12px 14px',fontSize:12,color:'var(--t4)' }}>No hot leads yet.</div>}
              {hotLeads?.map((l:any)=>(
                <Link key={l.id} href={`/med-spas/${l.id}`} style={{ textDecoration:'none' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:8,padding:'9px 14px',borderBottom:'1px solid var(--border)',cursor:'pointer' }}>
                    <div className="avatar" style={{ width:28,height:28,fontSize:9,fontWeight:700,flexShrink:0 }}>{l.name.slice(0,2).toUpperCase()}</div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:11,fontWeight:500,color:'var(--t1)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{l.name}</div>
                      <div style={{ fontSize:10,color:'var(--t3)' }}>{l.city}</div>
                    </div>
                    <div style={{ fontSize:11,fontWeight:600,color:'var(--gold)',fontFamily:'monospace',flexShrink:0 }}>
                      {l.estimated_retainer_value?fmt(l.estimated_retainer_value):'—'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Recent payments */}
            <div className="card">
              <div className="card-hd">
                <div className="card-title">Recent Payments</div>
                <Link href="/payments"><span style={{ fontSize:10,color:'var(--t3)' }}>All →</span></Link>
              </div>
              {payments?.map((p:any)=>(
                <div key={p.id} style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderBottom:'1px solid var(--border)',fontSize:11 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:500,color:'var(--t1)' }}>{p.client?.med_spa?.name??'—'}</div>
                    <div style={{ fontSize:10,color:'var(--t3)',textTransform:'capitalize',marginTop:1 }}>{p.payment_type?.replace(/_/g,' ')}</div>
                  </div>
                  <div style={{ fontFamily:'monospace',fontWeight:600,marginRight:8,color:p.status==='paid'?'var(--t1)':p.status==='overdue'?'var(--red)':'var(--amber)' }}>{fmt(p.amount??0)}</div>
                  <span className={`badge b-${p.status}`}>{p.status}</span>
                </div>
              ))}
            </div>

            {/* Activity */}
            <div className="card">
              <div className="card-hd"><div className="card-title">Activity</div></div>
              {(activity?.length??0)===0&&<div style={{ padding:'14px',fontSize:12,color:'var(--t4)' }}>No activity yet.</div>}
              {activity?.map((a:any)=>(
                <div key={a.id} style={{ display:'flex',gap:8,padding:'9px 14px',borderBottom:'1px solid var(--border)' }}>
                  <div className="tl-bubble" style={{ fontSize:12 }}>{EMOJI[a.activity_type]??'•'}</div>
                  <div>
                    <div style={{ fontSize:11,fontWeight:500,color:'var(--t1)' }}>{a.title}</div>
                    <div style={{ fontSize:10,color:'var(--t3)',marginTop:2 }}>{a.author?.full_name} · {fds(a.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
