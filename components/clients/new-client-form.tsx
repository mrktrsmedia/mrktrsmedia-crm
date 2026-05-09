'use client'
import { useState, useTransition } from 'react'
import { createClientRecord } from '@/lib/actions/clients'
import { SERVICE_PACKAGES, UPSELL_SERVICES } from '@/lib/constants'

interface Props {
  medSpas:  { id: string; name: string; city: string | null; state: string | null }[]
  users:    { id: string; full_name: string; role: string }[]
  contacts: { id: string; name: string; med_spa_id: string }[]
}

export function NewClientForm({ medSpas, users, contacts }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [medSpaId, setMedSpaId] = useState('')
  const [customRetainer, setCustomRetainer] = useState(5000)
  const [customSetup, setCustomSetup] = useState(6000)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])

  const filteredContacts = contacts.filter(c => c.med_spa_id === medSpaId)

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  const totalRetainer = customRetainer + selectedAddons.length * 1000

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    selectedAddons.forEach(a => fd.append('addons', a))
    startTransition(async () => {
      try { await createClientRecord(fd) }
      catch (err: any) { setError(err.message) }
    })
  }

  const pkg = SERVICE_PACKAGES[0]

  return (
    <form onSubmit={submit}>

      {/* Med spa selection */}
      <div className="fld">
        <label className="fld-lbl">Med Spa / Clinic *</label>
        <select className="inp" name="med_spa_id" required style={{ appearance: 'none' }} value={medSpaId} onChange={e => setMedSpaId(e.target.value)}>
          <option value="">Select a med spa…</option>
          {medSpas.map(s => <option key={s.id} value={s.id}>{s.name}{s.city ? ` — ${s.city}` : ''}</option>)}
        </select>
      </div>

      {/* Primary contact */}
      <div className="fld">
        <label className="fld-lbl">Primary Contact</label>
        <select className="inp" name="primary_contact_id" style={{ appearance: 'none' }}>
          <option value="">Select contact…</option>
          {filteredContacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Account manager */}
      <div className="fld">
        <label className="fld-lbl">Account Manager</label>
        <select className="inp" name="account_manager_id" style={{ appearance: 'none' }}>
          <option value="">Assign to me</option>
          {users.filter(u => ['admin','account_manager','client_success'].includes(u.role)).map(u => (
            <option key={u.id} value={u.id}>{u.full_name}</option>
          ))}
        </select>
      </div>

      {/* Start date */}
      <div className="fld">
        <label className="fld-lbl">Start Date *</label>
        <input className="inp" name="start_date" type="date" required />
      </div>

      {/* Service package */}
      <div className="fld">
        <label className="fld-lbl">Service Package</label>
        <input type="hidden" name="service_package" value={`Full Bundle + ${selectedAddons.length ? selectedAddons.join(', ') : 'no addons'}`} />

        <div style={{ background: 'var(--surface)', border: '1px solid var(--gold-line)', borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>Full Bundle</div>
              <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>Complete patient acquisition system</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--gold)', fontFamily: 'monospace', fontWeight: 600 }}>${pkg.setup_fee.toLocaleString()} setup</div>
              <div style={{ fontSize: 12, color: 'var(--gold)', fontFamily: 'monospace', fontWeight: 600 }}>${pkg.retainer.toLocaleString()}/mo</div>
            </div>
          </div>
          {pkg.includes.map((item, i) => (
            <div key={i} style={{ padding: '10px 14px', borderBottom: i < pkg.includes.length-1 ? '1px solid var(--border)' : undefined }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t1)', marginBottom: 3 }}>✓ {item.name}</div>
              <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 10 }}>
          <div className="sec-lbl" style={{ marginBottom: 8 }}>Add-on Services (+$1,000/mo each)</div>
          {UPSELL_SERVICES.map(service => (
            <label key={service.id} onClick={() => toggleAddon(service.id)} style={{ display: 'block', padding: '10px 14px', background: selectedAddons.includes(service.id) ? 'rgba(201,168,106,0.06)' : 'var(--surface)', border: `1px solid ${selectedAddons.includes(service.id) ? 'var(--gold-line)' : 'var(--border)'}`, borderRadius: 7, marginBottom: 8, cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <input type="checkbox" checked={selectedAddons.includes(service.id)} onChange={() => {}} style={{ marginTop: 2, width: 14, height: 14, flexShrink: 0 }} />
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--t1)' }}>{service.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--gold)', fontFamily: 'monospace' }}>+$1,000/mo</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3, lineHeight: 1.5 }}>{service.desc}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Pricing fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="fld">
          <label className="fld-lbl">Setup Fee ($) *</label>
          <input className="inp" name="setup_fee" type="number" required value={customSetup} onChange={e => setCustomSetup(Number(e.target.value))} min="0" />
        </div>
        <div className="fld">
          <label className="fld-lbl">Monthly Retainer ($) *</label>
          <input className="inp" name="retainer_amount" type="number" required value={totalRetainer} onChange={e => setCustomRetainer(Number(e.target.value) - selectedAddons.length * 1000)} min="1" />
        </div>
      </div>

      {/* Summary */}
      <div style={{ padding: '12px 14px', background: 'var(--gold-dim)', border: '1px solid var(--gold-line)', borderRadius: 7, marginBottom: 14, fontSize: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color: 'var(--t2)' }}>Setup fee:</span>
          <span style={{ color: 'var(--gold)', fontFamily: 'monospace', fontWeight: 600 }}>${customSetup.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--t2)' }}>Monthly retainer:</span>
          <span style={{ color: 'var(--gold)', fontFamily: 'monospace', fontWeight: 600 }}>${totalRetainer.toLocaleString()}/mo</span>
        </div>
      </div>

      <div className="fld">
        <label className="fld-lbl">Primary Goal</label>
        <input className="inp" name="primary_goal" placeholder="e.g. Scale to $150k/mo new patient bookings" />
      </div>

      {error && <div style={{ padding: '10px 12px', background: 'var(--red-dim)', border: '1px solid rgba(224,82,82,0.2)', borderRadius: 7, fontSize: 12, color: '#F09090', marginBottom: 14 }}>{error}</div>}

      <button type="submit" disabled={pending} className="btn-gold" style={{ width: '100%', height: 42, fontSize: 14 }}>
        {pending ? 'Creating client…' : 'Create Client Account'}
      </button>
    </form>
  )
}
