'use client'
import { useState, useTransition } from 'react'
import { createMedSpa } from '@/lib/actions/med-spas'

export function NewMedSpaForm() {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try { await createMedSpa(fd) }
      catch (err: any) { setError(err.message) }
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      <div className="fld">
        <label className="fld-lbl">Med Spa / Clinic Name *</label>
        <input className="inp" name="name" required placeholder="e.g. Lumina Cosmetic Clinic" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="fld">
          <label className="fld-lbl">Website</label>
          <input className="inp" name="website" type="url" placeholder="https://…" />
        </div>
        <div className="fld">
          <label className="fld-lbl">Instagram Handle</label>
          <input className="inp" name="instagram_handle" placeholder="@handle" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 12 }}>
        <div className="fld">
          <label className="fld-lbl">City</label>
          <input className="inp" name="city" placeholder="Beverly Hills" />
        </div>
        <div className="fld">
          <label className="fld-lbl">State</label>
          <input className="inp" name="state" placeholder="CA" maxLength={2} />
        </div>
      </div>

      <div className="fld">
        <label className="fld-lbl">Niche / Specialty</label>
        <input className="inp" name="niche_focus" placeholder="e.g. Injectables & Laser, Holistic Aesthetics…" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="fld">
          <label className="fld-lbl">Lead Quality</label>
          <select className="inp" name="lead_quality" style={{ appearance: 'none' }}>
            <option value="unscored">Unscored</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="hot">Hot 🔥</option>
          </select>
        </div>
        <div className="fld">
          <label className="fld-lbl">Score (1–10)</label>
          <input className="inp" name="lead_quality_score" type="number" min="1" max="10" placeholder="7" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="fld">
          <label className="fld-lbl">Offer Level</label>
          <select className="inp" name="estimated_offer_level" style={{ appearance: 'none' }}>
            <option value="low_ticket">Low Ticket</option>
            <option value="mid_ticket">Mid Ticket</option>
            <option value="high_ticket">High Ticket</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        <div className="fld">
          <label className="fld-lbl">Ad Status</label>
          <select className="inp" name="ad_status" style={{ appearance: 'none' }}>
            <option value="unknown">Unknown</option>
            <option value="not_running_ads">Not Running Ads</option>
            <option value="running_ads">Running Ads</option>
            <option value="weak_ads">Weak Ads</option>
          </select>
        </div>
      </div>

      <div className="fld">
        <label className="fld-lbl">Est. Retainer Value ($)</label>
        <input className="inp" name="estimated_retainer_value" type="number" min="0" placeholder="5000" />
      </div>

      <div className="fld">
        <label className="fld-lbl">Source of Lead</label>
        <input className="inp" name="source_of_lead" placeholder="Cold DM, Referral, Conference…" />
      </div>

      <div className="fld">
        <label className="fld-lbl">Website Notes</label>
        <textarea className="inp-area" name="website_quality_notes" placeholder="Website quality observations…" rows={2} />
      </div>

      <div className="fld">
        <label className="fld-lbl">Instagram Notes</label>
        <textarea className="inp-area" name="instagram_quality_notes" placeholder="Content quality, engagement, posting frequency…" rows={2} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 7, marginBottom: 14 }}>
        <input type="checkbox" id="hot" name="is_hot_lead" style={{ width: 16, height: 16 }} />
        <label htmlFor="hot" style={{ fontSize: 13, color: 'var(--t1)', cursor: 'pointer' }}>Mark as hot lead 🔥</label>
      </div>

      {error && (
        <div style={{ padding: '10px 12px', background: 'var(--red-dim)', border: '1px solid rgba(224,82,82,0.2)', borderRadius: 7, fontSize: 12, color: '#F09090', marginBottom: 14 }}>{error}</div>
      )}

      <button type="submit" disabled={pending} className="btn-gold" style={{ width: '100%', height: 42, fontSize: 14 }}>
        {pending ? 'Adding…' : 'Add Med Spa'}
      </button>
    </form>
  )
}
