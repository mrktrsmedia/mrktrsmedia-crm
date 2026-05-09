'use client'
import { useState, useTransition } from 'react'
import { logOutreach } from '@/lib/actions/med-spas'
import { OUTREACH_CHANNELS, OUTREACH_STAGES } from '@/lib/constants'

interface Props {
  medSpaId: string
  medSpaName: string
  onClose: () => void
}

export function LogOutreachModal({ medSpaId, medSpaName, onClose }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await logOutreach({
          med_spa_id:          medSpaId,
          channel:             fd.get('channel') as string,
          outreach_stage:      fd.get('outreach_stage') as string,
          message_type:        (fd.get('message_type') as string) || 'text',
          message_summary:     (fd.get('message_summary') as string) || undefined,
          response_summary:    (fd.get('response_summary') as string) || undefined,
          media_seen:          fd.get('media_seen') === 'on',
          replied:             fd.get('replied') === 'on',
          calendly_sent:       fd.get('calendly_sent') === 'on',
          call_booked:         fd.get('call_booked') === 'on',
          next_follow_up_date: (fd.get('next_follow_up_date') as string) || undefined,
        })
        onClose()
      } catch (err: any) { setError(err.message) }
    })
  }

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-title">Log Outreach — {medSpaName}</div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="fld">
              <label className="fld-lbl">Channel *</label>
              <select className="inp" name="channel" required style={{ appearance: 'none' }}>
                {OUTREACH_CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="fld">
              <label className="fld-lbl">Stage *</label>
              <select className="inp" name="outreach_stage" required style={{ appearance: 'none' }}>
                {OUTREACH_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="fld">
              <label className="fld-lbl">Message Type</label>
              <select className="inp" name="message_type" style={{ appearance: 'none' }}>
                {['text','voice_note','video','meme','call','email','loom_video_audit'].map(t => (
                  <option key={t} value={t}>{t.replace(/_/g,' ')}</option>
                ))}
              </select>
            </div>
            <div className="fld">
              <label className="fld-lbl">Follow-up Date</label>
              <input className="inp" name="next_follow_up_date" type="date" />
            </div>
          </div>

          <div className="fld">
            <label className="fld-lbl">Message Summary</label>
            <textarea className="inp-area" name="message_summary" placeholder="What did you send / say?" rows={2} />
          </div>

          <div className="fld">
            <label className="fld-lbl">Response Summary</label>
            <textarea className="inp-area" name="response_summary" placeholder="What did they say back? (if anything)" rows={2} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
            {[
              { name: 'media_seen',   label: 'Media Seen' },
              { name: 'replied',      label: 'Replied' },
              { name: 'calendly_sent',label: 'Calendly Sent' },
              { name: 'call_booked',  label: 'Call Booked ✓' },
            ].map(item => (
              <label key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: 'var(--t2)' }}>
                <input type="checkbox" name={item.name} style={{ width: 14, height: 14 }} />
                {item.label}
              </label>
            ))}
          </div>

          {error && (
            <div style={{ padding: '10px 12px', background: 'var(--red-dim)', border: '1px solid rgba(224,82,82,0.2)', borderRadius: 7, fontSize: 12, color: '#F09090', marginBottom: 14 }}>{error}</div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={pending} className="btn-gold" style={{ flex: 2 }}>
              {pending ? 'Logging…' : 'Log Outreach'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
