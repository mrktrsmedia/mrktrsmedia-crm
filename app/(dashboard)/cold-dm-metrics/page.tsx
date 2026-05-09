import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Cold DM Metrics' }

function pct(n:number,d:number){return d>0?((n/d)*100).toFixed(1)+'%':'—'}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default async function ColdDMMetricsPage({ searchParams }: { searchParams: { year?: string } }) {
  const sb   = createClient()
  const now  = new Date()
  const year = Number(searchParams.year||now.getFullYear())

  const { data: metrics } = await sb
    .from('cold_dm_metrics_monthly')
    .select('*')
    .eq('year',year)
    .order('month')

  const byMonth = (m:number)=>metrics?.find((r:any)=>r.month===m) as any

  const totals = metrics?.reduce((acc:any,m:any)=>({
    initiated:     (acc.initiated||0)    +(m.total_initiated||0),
    media_seen:    (acc.media_seen||0)   +(m.total_media_seen||0),
    engaged:       (acc.engaged||0)      +(m.total_engaged||0),
    calendly_sent: (acc.calendly_sent||0)+(m.total_calendly_sent||0),
    booked:        (acc.booked||0)       +(m.total_booked||0),
  }),{}) ?? {}

  const YEARS = [now.getFullYear()-1,now.getFullYear()]

  const RateCell = ({ rate }: { rate: number|null }) => {
    if(rate==null) return <td className="num" style={{ color:'var(--t4)' }}>—</td>
    const cls=rate>=50?'r-good':rate>=25?'r-mid':'r-bad'
    return <td className={`num ${cls}`}>{rate.toFixed(1)}%</td>
  }

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100vh' }}>
      <Topbar
        title="Cold DM Metrics"
        subtitle={`${year} · auto-calculated from outreach logs`}
        actions={
          <div style={{ display:'flex',gap:4 }}>
            {YEARS.map(y=>(
              <Link key={y} href={`/cold-dm-metrics?year=${y}`} style={{ textDecoration:'none' }}>
                <button className={`ftab${year===y?' on':''}`}>{y}</button>
              </Link>
            ))}
          </div>
        }
      />

      <div style={{ flex:1,overflowY:'auto',padding:'14px 20px',display:'flex',flexDirection:'column',gap:12 }}>

        {/* KPI cards */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:8 }}>
          {[
            { l:'Initiated',    v:totals.initiated??0,    sub:'Total DMs sent' },
            { l:'Media Seen',   v:totals.media_seen??0,   sub:pct(totals.media_seen,totals.initiated)+' MSR',   color:'var(--blue)' },
            { l:'Engaged',      v:totals.engaged??0,      sub:pct(totals.engaged,totals.initiated)+' PRR',       color:'var(--amber)' },
            { l:'Calendly\'d',  v:totals.calendly_sent??0,sub:pct(totals.calendly_sent,totals.initiated)+' CSR', color:'var(--purple)' },
            { l:'Booked',       v:totals.booked??0,       sub:pct(totals.booked,totals.initiated)+' ABR',        color:'var(--gold)', accent:true },
            { l:'Cal → Book',   v:pct(totals.booked,totals.calendly_sent), sub:'Close rate',                     color:'var(--green)' },
          ].map(k=>(
            <div key={k.l} className={`metric${k.accent?' m-gold':''}`}>
              <span className="metric-lbl">{k.l}</span>
              <span className="metric-val" style={{ fontSize:20,color:(k as any).color??'var(--t1)' }}>{k.v}</span>
              <span className="metric-meta">{k.sub}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card" style={{ flex:1 }}>
          <div className="card-hd">
            <div><div className="card-title">Monthly Breakdown</div><div className="card-sub">All data auto-generated from outreach_logs</div></div>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width:140 }}>Metric</th>
                  {MONTHS.map(m=><th key={m} style={{ textAlign:'right' }}>{m}</th>)}
                  <th style={{ textAlign:'right',background:'var(--surface3)' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key:'total_initiated',     label:'A — Initiated',    tkey:'initiated' },
                  { key:'total_media_seen',    label:'MS — Media Seen',  tkey:'media_seen' },
                  { key:'total_engaged',       label:'B — Engaged',      tkey:'engaged' },
                  { key:'total_calendly_sent', label:'C — Calendly\'d',  tkey:'calendly_sent' },
                  { key:'total_booked',        label:'D — Booked',       tkey:'booked', gold:true },
                ].map(row=>(
                  <tr key={row.key}>
                    <td style={{ color:row.gold?'var(--gold)':'var(--t2)',fontWeight:row.gold?600:undefined }}>{row.label}</td>
                    {Array.from({length:12},(_,i)=>{
                      const m=byMonth(i+1)
                      return <td key={i} className="num" style={{ color:row.gold&&(m?.[row.key]>0)?'var(--green)':undefined }}>{m?.[row.key]??'—'}</td>
                    })}
                    <td className="num" style={{ background:'var(--surface3)',fontWeight:600,color:row.gold?'var(--green)':'var(--t1)' }}>
                      {totals[row.tkey??'']??'—'}
                    </td>
                  </tr>
                ))}

                <tr><td colSpan={14} style={{ height:1,background:'rgba(201,168,106,0.12)',padding:0 }}/></tr>

                {[
                  { label:'MSR · MS/A', n:'total_media_seen',    d:'total_initiated',    tn:'media_seen',    td:'initiated' },
                  { label:'PRR · B/A',  n:'total_engaged',       d:'total_initiated',    tn:'engaged',       td:'initiated' },
                  { label:'ABR · D/A',  n:'total_booked',        d:'total_initiated',    tn:'booked',        td:'initiated' },
                ].map(row=>(
                  <tr key={row.label}>
                    <td className="r-key">{row.label}</td>
                    {Array.from({length:12},(_,i)=>{
                      const m=byMonth(i+1)
                      if(!m) return <td key={i} className="num" style={{ color:'var(--t4)' }}>—</td>
                      const rate=m[row.d]>0?(m[row.n]/m[row.d])*100:null
                      if(rate==null) return <td key={i} className="num" style={{ color:'var(--t4)' }}>—</td>
                      const cls=rate>=50?'r-good':rate>=25?'r-mid':'r-bad'
                      return <td key={i} className={`num ${cls}`}>{rate.toFixed(1)}%</td>
                    })}
                    <td className="num" style={{ background:'var(--surface3)',fontWeight:600 }}>
                      {pct(totals[row.tn??''],totals[row.td??''])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display:'flex',gap:16,padding:'10px 14px',borderTop:'1px solid var(--border)',fontSize:10 }}>
            {[{c:'var(--green)',l:'≥ 50% — strong'},{c:'var(--amber)',l:'25–49% — developing'},{c:'var(--red)',l:'< 25% — needs work'}].map(l=>(
              <div key={l.l} style={{ display:'flex',alignItems:'center',gap:5,color:'var(--t3)' }}>
                <div style={{ width:6,height:6,borderRadius:'50%',background:l.c }}/>
                {l.l}
              </div>
            ))}
            <div style={{ marginLeft:'auto',color:'var(--t4)' }}>All data from outreach_logs — no manual entry</div>
          </div>
        </div>
      </div>
    </div>
  )
}
