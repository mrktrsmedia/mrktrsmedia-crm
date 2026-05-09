import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import { OutreachPageClient } from '@/components/shared/outreach-page-client'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Outreach Log' }

export default async function OutreachPage() {
  const sb = createClient()
  const [{ data: logs }, { data: medSpas }] = await Promise.all([
    sb.from('outreach_logs').select('*,med_spa:med_spas(id,name),contact:contacts(name)').order('outreach_date',{ascending:false}).limit(200),
    sb.from('med_spas').select('id,name').eq('is_archived',false).order('name'),
  ])

  // Funnel totals
  const total = logs?.length??0
  const seen  = logs?.filter(l=>l.media_seen).length??0
  const rep   = logs?.filter(l=>l.replied).length??0
  const cal   = logs?.filter(l=>l.calendly_sent).length??0
  const book  = logs?.filter(l=>l.call_booked).length??0

  const pct = (n:number,d:number)=>d>0?((n/d)*100).toFixed(1)+'%':'—'

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100vh' }}>
      <Topbar
        title="Outreach Log"
        subtitle={`${total} records`}
        actions={<OutreachPageClient medSpas={medSpas??[]} />}
      />

      {/* Funnel summary */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,padding:'12px 20px',borderBottom:'1px solid var(--border)',flexShrink:0 }}>
        {[
          { l:'Initiated',     v:total, pct:'100%' },
          { l:'Media Seen',    v:seen,  pct:pct(seen,total),  color:'var(--blue)' },
          { l:'Replied',       v:rep,   pct:pct(rep,total),   color:'var(--amber)' },
          { l:'Calendly Sent', v:cal,   pct:pct(cal,total),   color:'var(--purple)' },
          { l:'Call Booked',   v:book,  pct:pct(book,total),  color:'var(--green)' },
        ].map(s=>(
          <div key={s.l} className="metric">
            <span className="metric-lbl">{s.l}</span>
            <span className="metric-val" style={{ fontSize:20,color:(s as any).color??'var(--t1)' }}>{s.v}</span>
            <span className="metric-meta">{s.pct}</span>
          </div>
        ))}
      </div>

      <div style={{ flex:1,overflowY:'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Date</th><th>Med Spa</th><th>Contact</th>
              <th>Channel</th><th>Stage</th>
              <th style={{ textAlign:'center' }}>Seen</th>
              <th style={{ textAlign:'center' }}>Replied</th>
              <th style={{ textAlign:'center' }}>Cal</th>
              <th style={{ textAlign:'center' }}>Booked</th>
              <th>Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {(logs??[]).map((l:any)=>(
              <tr key={l.id}>
                <td style={{ fontFamily:'monospace',fontSize:11,color:'var(--t3)',whiteSpace:'nowrap' }}>
                  {l.outreach_date?new Date(l.outreach_date).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'—'}
                </td>
                <td style={{ fontWeight:500,color:'var(--t1)' }}>{l.med_spa?.name??'—'}</td>
                <td style={{ fontSize:11,color:'var(--t2)' }}>{l.contact?.name??'—'}</td>
                <td><span style={{ fontSize:10,padding:'2px 6px',borderRadius:3,background:'var(--surface2)',color:'var(--t3)',textTransform:'capitalize' }}>{l.channel?.replace(/_/g,' ')}</span></td>
                <td style={{ fontSize:11,color:'var(--t2)',textTransform:'capitalize' }}>{l.outreach_stage?.replace(/_/g,' ')}</td>
                <td style={{ textAlign:'center',color:l.media_seen?'var(--green)':'var(--t4)' }}>{l.media_seen?'✓':'—'}</td>
                <td style={{ textAlign:'center',color:l.replied?'var(--amber)':'var(--t4)' }}>{l.replied?'✓':'—'}</td>
                <td style={{ textAlign:'center',color:l.calendly_sent?'var(--purple)':'var(--t4)' }}>{l.calendly_sent?'✓':'—'}</td>
                <td style={{ textAlign:'center',color:l.call_booked?'var(--green)':'var(--t4)',fontWeight:l.call_booked?700:undefined }}>{l.call_booked?'✓':'—'}</td>
                <td style={{ fontFamily:'monospace',fontSize:11,color:'var(--t3)' }}>
                  {l.next_follow_up_date?new Date(l.next_follow_up_date).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'—'}
                </td>
              </tr>
            ))}
            {(logs?.length??0)===0&&<tr><td colSpan={10} style={{ textAlign:'center',padding:32,color:'var(--t4)' }}>No outreach logged yet. Click "Log Outreach" to start.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
