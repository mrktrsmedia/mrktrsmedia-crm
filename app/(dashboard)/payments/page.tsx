import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import { MarkPaidBtn } from '@/components/shared/mark-paid-btn'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Payments' }
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n)

export default async function PaymentsPage() {
  const sb = createClient()
  const { data: payments } = await sb
    .from('payments')
    .select('*,client:clients(id,med_spa:med_spas(name))')
    .order('due_date', { ascending: false })
    .limit(200)

  const overdue = payments?.filter(p => p.status === 'overdue').reduce((s, p) => s + (p.amount ?? 0), 0) ?? 0
  const pending = payments?.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount ?? 0), 0) ?? 0
  const collected = payments?.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount ?? 0), 0) ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Topbar title="Payments" subtitle={`${payments?.length ?? 0} records`} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, padding: '12px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {[
          { l: 'Collected', v: fmt(collected), color: 'var(--green)', m: 'm-green' },
          { l: 'Pending',   v: fmt(pending),   color: 'var(--amber)' },
          { l: 'Overdue',   v: fmt(overdue),   color: overdue > 0 ? 'var(--red)' : 'var(--t1)', m: overdue > 0 ? 'm-red' : '' },
        ].map(s => (
          <div key={s.l} className={`metric${s.m ? ' ' + s.m : ''}`}>
            <span className="metric-lbl">{s.l}</span>
            <span className="metric-val" style={{ fontSize: 18, color: s.color }}>{s.v}</span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr><th>Client</th><th>Type</th><th style={{ textAlign: 'right' }}>Amount</th><th>Status</th><th>Due</th><th>Paid</th><th></th></tr>
          </thead>
          <tbody>
            {(payments ?? []).map((p: any) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 500, color: 'var(--t1)' }}>{p.client?.med_spa?.name ?? '—'}</td>
                <td style={{ fontSize: 11, color: 'var(--t2)', textTransform: 'capitalize' }}>{p.payment_type?.replace(/_/g, ' ')}</td>
                <td className="num" style={{ fontWeight: 600, color: p.status === 'paid' ? 'var(--green)' : p.status === 'overdue' ? 'var(--red)' : 'var(--amber)' }}>{fmt(p.amount ?? 0)}</td>
                <td><span className={`badge b-${p.status}`}>{p.status}</span></td>
                <td style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--t3)' }}>
                  {p.due_date ? new Date(p.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </td>
                <td style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--t3)' }}>
                  {p.paid_date ? new Date(p.paid_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                </td>
                <td>{p.status !== 'paid' && p.client?.id && <MarkPaidBtn paymentId={p.id} clientId={p.client.id} />}</td>
              </tr>
            ))}
            {(payments?.length ?? 0) === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--t4)' }}>No payments yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
