import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Reports' }
const fmt = (n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:0}).format(n)

export default async function ReportsPage() {
  const sb = createClient()
  const [{ data: clients },{ data: logs },{ data: tasks }] = await Promise.all([
    sb.from('clients').select('id,retainer_amount,status').eq('status','active'),
    sb.from('outreach_logs').select('id,call_booked,replied,media_seen'),
    sb.from('tasks').select('id,status,priority'),
  ])
  const mrr=clients?.reduce((s,c)=>s+(c.retainer_amount??0),0)??0
  const booked=logs?.filter(l=>l.call_booked).length??0
  const replied=logs?.filter(l=>l.replied).length??0
  const total=logs?.length??0
  const pct=(n:number,d:number)=>d>0?((n/d)*100).toFixed(1)+'%':'—'
  const overdue=tasks?.filter(t=>t.status==='pending'&&t.priority==='urgent').length??0
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh'}}>
      <Topbar title="Reports" subtitle="Agency performance at a glance" />
      <div style={{flex:1,overflowY:'auto',padding:'14px 20px',display:'flex',flexDirection:'column',gap:12}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
          {[
            {l:'Active Clients',v:clients?.length??0},
            {l:'MRR',v:fmt(mrr),gold:true},
            {l:'Total Outreach',v:total},
            {l:'Calls Booked',v:booked,gold:booked>0},
          ].map(s=>(
            <div key={s.l} className={`metric${s.gold?' m-gold':''}`}>
              <span className="metric-lbl">{s.l}</span>
              <span className="metric-val" style={{fontSize:18,color:s.gold?'var(--gold)':'var(--t1)'}}>{s.v}</span>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
          {[
            {l:'Reply Rate',v:pct(replied,total)},
            {l:'Booking Rate',v:pct(booked,total)},
            {l:'Urgent Tasks',v:overdue,red:overdue>0},
          ].map(s=>(
            <div key={s.l} className={`metric${(s as any).red?' m-red':''}`}>
              <span className="metric-lbl">{s.l}</span>
              <span className="metric-val" style={{fontSize:18,color:(s as any).red&&overdue>0?'var(--red)':'var(--t1)'}}>{s.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
