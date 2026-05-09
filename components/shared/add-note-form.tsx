'use client'
import { useState, useTransition } from 'react'
import { addNote } from '@/lib/actions/med-spas'
import { addClientNote } from '@/lib/actions/clients'

export function AddNoteForm({ medSpaId, clientId }: { medSpaId?: string; clientId?: string }) {
  const [open, setOpen] = useState(false)
  const [body, setBody] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setError('')
    startTransition(async () => {
      try {
        if (medSpaId) await addNote(medSpaId, body)
        else if (clientId) await addClientNote(clientId, body)
        setBody('')
        setOpen(false)
      } catch (err: any) { setError(err.message) }
    })
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ fontSize: 11, color: 'var(--t3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        + Add Note
      </button>
    )
  }

  return (
    <form onSubmit={submit} style={{ padding: '10px 14px', borderTop: '1px solid var(--border)' }}>
      <textarea
        className="inp-area"
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Add a note…"
        rows={3}
        autoFocus
        style={{ marginBottom: 8 }}
      />
      {error && <div style={{ fontSize: 11, color: '#F09090', marginBottom: 8 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 6 }}>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost btn-sm">Cancel</button>
        <button type="submit" disabled={pending || !body.trim()} className="btn-gold btn-sm">
          {pending ? 'Saving…' : 'Save Note'}
        </button>
      </div>
    </form>
  )
}
