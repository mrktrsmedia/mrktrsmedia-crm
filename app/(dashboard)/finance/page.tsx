import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Finance' }
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n)

export default async function FinancePage() {
  const sb = createClient()
  const now = new Date()
  const m1 = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const [{ data: clients }, { data: allPayments }] = await Promise.all([
    sb.from('clients').select('id,retainer_amount,setup_fee,status,start_date,med_spa:med_spas(name)').order('retainer_amount', { ascending: false }),
    sb.from('payments').select('*,client:clients(med_spa:med_spas(name))').order('due_date', { ascending: false }),
  ])

  const active = clients?.filter(c => c.status === 'active') ?? []
  const mrr = active.reduce((s, c) => s + (c.retainer_amount ?? 0), 0)
  const totalSetup = clients?.reduce((s, c) => s + (c.setup_fee ?? 0), 0) ?? 0
  const collected = allPayments?.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount ?? 0), 0) ?? 0
  const overdue = allPayments?.filter(p => p.status === 'overdue').reduce((s, p) => s + (p.amount ?? 0), 0) ?? 0
  const pending = allPayments?.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount ?? 0), 0) ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Topbar title="Finance" subtitle="Revenue & collection overview" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {[
            { l: 'MRR',           v: fmt(mrr),       gold: true },
            { l: 'ARR',           v: fmt(mrr * 12),  gold: true },
            { l: 'Collected',     v: fmt(collected),  green: true },
            { l: 'Overdue',       v: fmt(overdue),    red: overdue > 0 },
            { l: 'Pending',       v: fmt(pending) },
          ].map(s => (
            <div key={s.l} className={`metric${s.gold ? ' m-gold' : (s as any).red ? ' m-red' : (s as any).green ? ' m-green' : ''}`}>
              <span className="metric-lbl">{s.l}</span>
              <span className="metric-val" style={{ fontSize: 18, color: s.gold ? 'var(--gold)' : (s as any).red && overdue > 0 ? 'var(--red)' : (s as any).green ? 'var(--green)' : 'var(--t1)' }}>{s.v}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-hd"><div className="card-title">Active Client MRR</div></div>
          <table className="tbl">
            <thead><tr><th>Client</th><th>Package</th><th style={{ textAlign: 'right' }}>Retainer / mo</th><th style={{ textAlign: 'right' }}>Setup Fee</th><th>Start Date</th><th>Status</th></tr></thead>
            <tbody>
              {active.map((c: any) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500, color: 'var(--t1)' }}>{c.med_spa?.name ?? '—'}</td>
                  <td style={{ fontSize: 11, color: 'var(--t2)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.service_package ?? '—'}</td>
                  <td className="num" style={{ color: 'var(--gold)', fontWeight: 600 }}>{fmt(c.retainer_amount ?? 0)}</td>
                  <td className="num" style={{ color: 'var(--t2)' }}>{fmt(c.setup_fee ?? 0)}</td>
                  <td style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'monospace' }}>
                    {c.start_date ? new Date(c.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td><span className="badge b-active">Active</span></td>
                </tr>
              ))}
              {active.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--t4)' }}>No active clients yet.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-hd"><div className="card-title">All Payments</div></div>
          <table className="tbl">
            <thead><tr><th>Client</th><th>Type</th><th style={{ textAlign: 'right' }}>Amount</th><th>Status</th><th>Due</th><th>Paid</th></tr></thead>
            <tbody>
              {(allPayments ?? []).slice(0, 50).map((p: any) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500, color: 'var(--t1)' }}>{p.client?.med_spa?.name ?? '—'}</td>
                  <td style={{ fontSize: 11, color: 'var(--t2)', textTransform: 'capitalize' }}>{p.payment_type?.replace(/_/g, ' ')}</td>
                  <td className="num" style={{ fontWeight: 600, color: p.status === 'paid' ? 'var(--green)' : p.status === 'overdue' ? 'var(--red)' : 'var(--amber)' }}>{fmt(p.amount ?? 0)}</td>
                  <td><span className={`badge b-${p.status}`}>{p.status}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'monospace' }}>
                    {p.due_date ? new Date(p.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'monospace' }}>
                    {p.paid_date ? new Date(p.paid_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
