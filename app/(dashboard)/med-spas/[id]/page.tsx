import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Topbar } from '@/components/layout/topbar'
import { AddNoteForm } from '@/components/shared/add-note-form'
import { MedSpaDetailClient } from '@/components/med-spas/med-spa-detail-client'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const sb = createClient()
  const { data } = await sb.from('med_spas').select('name').eq('id',params.id).single()
  return { title: data?.name ?? 'Med Spa' }
}

const fmt = (n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:0}).format(n)
const fd  = (d:string|null)=>d?new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'—'
const fds = (d:string|null)=>d?new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'—'

export default async function MedSpaDetailPage({ params }: { params: { id: string } }) {
  const sb = createClient()
  const [
    { data: spa },
    { data: contacts },
    { data: notes },
    { data: outreach },
    { data: tasks },
    { data: activity },
  ] = await Promise.all([
    sb.from('med_spas').select('*').eq('id',params.id).single(),
    sb.from('contacts').select('*').eq('med_spa_id',params.id).order('is_primary_contact',{ascending:false}),
    sb.from('notes').select('*,author:users(full_name)').eq('med_spa_id',params.id).order('created_at',{ascending:false}).limit(20),
    sb.from('outreach_logs').select('*,contact:contacts(name)').eq('med_spa_id',params.id).order('outreach_date',{ascending:false}).limit(30),
    sb.from('tasks').select('*').eq('med_spa_id',params.id).in('status',['pending','in_progress']).order('due_date'),
    sb.from('activity_timeline').select('*,author:users(full_name)').eq('med_spa_id',params.id).order('created_at',{ascending:false}).limit(20),
  ])
  if (!spa) notFound()

  const now = new Date()
  const isOv = spa.next_follow_up_date && new Date(spa.next_follow_up_date) < now
  const DOT: Record<string,string> = { urgent:'var(--red)', high:'var(--amber)', medium:'var(--blue)', low:'var(--t4)' }

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100vh' }}>
      <Topbar
        title={spa.name}
        subtitle={[spa.city,spa.state].filter(Boolean).join(', ')||'—'}
        actions={
          <div style={{ display:'flex',gap:8 }}>
            <Link href="/med-spas"><button className="btn-ghost btn-sm">← Back</button></Link>
            {spa.status!=='client' && <Link href={`/clients/new?med_spa_id=${spa.id}`}><button className="btn-ghost btn-sm">Convert to Client</button></Link>}
            <MedSpaDetailClient medSpaId={spa.id} medSpaName={spa.name} />
          </div>
        }
      />

      <div style={{ flex:1,display:'grid',gridTemplateColumns:'230px 1fr',overflow:'hidden' }}>

        {/* LEFT */}
        <div style={{ borderRight:'1px solid var(--border)',overflowY:'auto',padding:14,display:'flex',flexDirection:'column',gap:12 }}>

          <div style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,padding:14 }}>
            <div className="avatar" style={{ width:44,height:44,fontSize:16,fontWeight:700,marginBottom:10 }}>{spa.name.slice(0,2).toUpperCase()}</div>
            <div style={{ fontWeight:700,fontSize:14,color:'var(--t1)',marginBottom:4 }}>{spa.name}</div>
            <div style={{ fontSize:11,color:'var(--t3)',marginBottom:8 }}>{spa.niche_focus}</div>
            <div style={{ display:'flex',gap:5,flexWrap:'wrap' }}>
              <span className={`badge b-${spa.status}`}>{spa.status==='booked'?'Call Booked':spa.status}</span>
              {spa.is_hot_lead && <span className="hot-badge">🔥 HOT</span>}
            </div>
          </div>

          <div>
            <div style={{ fontSize:9,fontWeight:600,letterSpacing:'1.2px',textTransform:'uppercase',color:'var(--t4)',marginBottom:8 }}>Pipeline</div>
            <div className="kv"><span className="kv-k">Stage</span><span style={{ fontSize:11,color:'var(--t1)',textTransform:'capitalize' }}>{spa.pipeline_stage?.replace(/_/g,' ')}</span></div>
            <div className="kv"><span className="kv-k">Quality</span>
              <div style={{ display:'flex',gap:4,alignItems:'center' }}>
                <span style={{ fontSize:10,fontWeight:600,color:spa.lead_quality==='hot'?'#F09090':spa.lead_quality==='high'?'var(--amber)':spa.lead_quality==='medium'?'var(--blue)':'var(--t3)',textTransform:'capitalize' }}>{spa.lead_quality}</span>
                {spa.lead_quality_score&&<span style={{ fontSize:10,color:'var(--t3)',fontFamily:'monospace' }}>{spa.lead_quality_score}/10</span>}
              </div>
            </div>
            <div className="kv"><span className="kv-k">Est. Retainer</span><span className="kv-v gold">{spa.estimated_retainer_value?fmt(spa.estimated_retainer_value):'—'}</span></div>
            <div className="kv"><span className="kv-k">Follow-up</span>
              <span style={{ fontSize:11,fontFamily:'monospace',color:isOv?'var(--red)':'var(--t2)',fontWeight:isOv?600:undefined }}>
                {fds(spa.next_follow_up_date)}{isOv?' ⚠':''}
              </span>
            </div>
            <div className="kv"><span className="kv-k">Last Contacted</span><span style={{ fontSize:11,color:'var(--t3)' }}>{fds(spa.last_contacted_at)}</span></div>
            <div className="kv"><span className="kv-k">Source</span><span style={{ fontSize:11,color:'var(--t2)' }}>{spa.source_of_lead??'—'}</span></div>
          </div>

          {(spa.website||spa.instagram_handle) && (
            <div>
              <div className="divider"/>
              <div style={{ fontSize:9,fontWeight:600,letterSpacing:'1.2px',textTransform:'uppercase',color:'var(--t4)',marginBottom:8 }}>Links</div>
              {spa.website&&<a href={spa.website} target="_blank" rel="noopener noreferrer" style={{ display:'block',fontSize:11,color:'var(--blue)',marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>🌐 {spa.website}</a>}
              {spa.instagram_handle&&<a href={`https://instagram.com/${spa.instagram_handle.replace('@','')}`} target="_blank" rel="noopener noreferrer" style={{ display:'block',fontSize:11,color:'#E1306C' }}>📷 {spa.instagram_handle}</a>}
            </div>
          )}

          {(contacts?.length??0)>0 && (
            <div>
              <div className="divider"/>
              <div style={{ fontSize:9,fontWeight:600,letterSpacing:'1.2px',textTransform:'uppercase',color:'var(--t4)',marginBottom:8 }}>Contacts</div>
              {contacts!.map((c:any)=>(
                <div key={c.id} style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:6,padding:10,marginBottom:6 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:4 }}>
                    <div className="avatar round" style={{ width:20,height:20,fontSize:8,fontWeight:700 }}>{c.name.slice(0,2).toUpperCase()}</div>
                    <div>
                      <div style={{ fontSize:11,fontWeight:600,color:'var(--t1)' }}>{c.name}</div>
                      <div style={{ fontSize:9,color:'var(--t3)' }}>{c.role}{c.is_decision_maker?' · DM':''}</div>
                    </div>
                  </div>
                  {c.email&&<a href={`mailto:${c.email}`} style={{ display:'block',fontSize:10,color:'var(--blue)',marginTop:3 }}>{c.email}</a>}
                  {c.instagram&&<a href={`https://instagram.com/${c.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" style={{ display:'block',fontSize:10,color:'#E1306C',marginTop:2 }}>{c.instagram}</a>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ overflowY:'auto',padding:14,display:'flex',flexDirection:'column',gap:10 }}>

          {/* Research notes */}
          {(spa.website_quality_notes||spa.instagram_quality_notes) && (
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
              {spa.website_quality_notes && (
                <div style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,padding:12 }}>
                  <div style={{ fontSize:9,fontWeight:600,letterSpacing:'1px',textTransform:'uppercase',color:'var(--t4)',marginBottom:6 }}>Website Analysis</div>
                  <p style={{ fontSize:11,color:'var(--t2)',lineHeight:1.6,margin:0 }}>{spa.website_quality_notes}</p>
                </div>
              )}
              {spa.instagram_quality_notes && (
                <div style={{ background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,padding:12 }}>
                  <div style={{ fontSize:9,fontWeight:600,letterSpacing:'1px',textTransform:'uppercase',color:'var(--t4)',marginBottom:6 }}>Instagram Analysis</div>
                  <p style={{ fontSize:11,color:'var(--t2)',lineHeight:1.6,margin:0 }}>{spa.instagram_quality_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Open tasks */}
          {(tasks?.length??0)>0 && (
            <div className="card">
              <div className="card-hd"><div className="card-title">Open Tasks ({tasks!.length})</div></div>
              {tasks!.map((t:any)=>{
                const due=t.due_date?new Date(t.due_date):null
                const ov=due&&due<now
                return (
                  <div key={t.id} style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderBottom:'1px solid var(--border)',fontSize:11 }}>
                    <div style={{ width:5,height:5,borderRadius:'50%',background:DOT[t.priority]??'var(--t4)',flexShrink:0 }}/>
                    <span style={{ flex:1,color:'var(--t1)' }}>{t.title}</span>
                    <span style={{ fontSize:10,color:ov?'var(--red)':'var(--t3)',fontWeight:ov?600:undefined }}>
                      {due?due.toLocaleDateString('en-US',{month:'short',day:'numeric'}):'—'}{ov?' ⚠':''}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Notes */}
          <div className="card">
            <div className="card-hd">
              <div className="card-title">Notes</div>
              <AddNoteForm medSpaId={spa.id} />
            </div>
            {(notes?.length??0)===0 && <div style={{ padding:'14px',fontSize:12,color:'var(--t4)' }}>No notes yet. Add your first note above.</div>}
            {notes?.map((n:any)=>(
              <div key={n.id} style={{ padding:'10px 14px',borderBottom:'1px solid var(--border)' }}>
                <p style={{ fontSize:12,color:'var(--t1)',lineHeight:1.6,margin:0 }}>{n.body}</p>
                <div style={{ fontSize:10,color:'var(--t3)',marginTop:5 }}>{n.author?.full_name} · {fds(n.created_at)}</div>
              </div>
            ))}
          </div>

          {/* Outreach log */}
          <div className="card">
            <div className="card-hd">
              <div className="card-title">Outreach Log ({outreach?.length??0})</div>
            </div>
            {(outreach?.length??0)===0 && <div style={{ padding:'14px',fontSize:12,color:'var(--t4)' }}>No outreach logged yet.</div>}
            {outreach?.map((l:any)=>(
              <div key={l.id} style={{ display:'flex',gap:10,padding:'9px 14px',borderBottom:'1px solid var(--border)',alignItems:'flex-start' }}>
                <div style={{ width:5,height:5,borderRadius:'50%',background:l.call_booked?'var(--green)':l.calendly_sent?'var(--blue)':l.replied?'var(--amber)':'var(--t4)',flexShrink:0,marginTop:5 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:6,flexWrap:'wrap' }}>
                    <span style={{ fontSize:11,fontWeight:500,color:'var(--t1)',textTransform:'capitalize' }}>{l.outreach_stage?.replace(/_/g,' ')}</span>
                    <span style={{ fontSize:9,padding:'1px 5px',borderRadius:3,background:'var(--surface2)',color:'var(--t3)',textTransform:'capitalize' }}>{l.channel?.replace(/_/g,' ')}</span>
                    {l.media_seen&&<span style={{ fontSize:9,color:'var(--blue)' }}>Seen</span>}
                    {l.replied&&<span style={{ fontSize:9,color:'var(--amber)' }}>Replied</span>}
                    {l.calendly_sent&&<span style={{ fontSize:9,color:'var(--purple)' }}>Cal Sent</span>}
                    {l.call_booked&&<span style={{ fontSize:9,color:'var(--green)',fontWeight:600 }}>BOOKED ✓</span>}
                  </div>
                  {l.message_summary&&<div style={{ fontSize:10,color:'var(--t2)',marginTop:3,lineHeight:1.5 }}>{l.message_summary}</div>}
                  {l.response_summary&&<div style={{ fontSize:10,color:'var(--green)',marginTop:2,lineHeight:1.5 }}>Reply: {l.response_summary}</div>}
                  {l.next_follow_up_date&&<div style={{ fontSize:9,color:'var(--amber)',marginTop:2 }}>→ Follow up {fds(l.next_follow_up_date)}</div>}
                </div>
                <div style={{ fontSize:10,color:'var(--t3)',whiteSpace:'nowrap',fontFamily:'monospace' }}>{fds(l.outreach_date)}</div>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="card">
            <div className="card-hd"><div className="card-title">Activity Timeline</div></div>
            {activity?.map((a:any)=>(
              <div key={a.id} style={{ display:'flex',gap:10,padding:'9px 14px',borderBottom:'1px solid var(--border)' }}>
                <div className="tl-bubble" style={{ fontSize:12 }}>
                  {a.activity_type==='email'?'📤':a.activity_type==='outreach'?'💬':a.activity_type==='stage_change'?'→':'•'}
                </div>
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
