'use client'
import { useState, useTransition } from 'react'
import { createTask } from '@/lib/actions/tasks'
import { TASK_TYPES } from '@/lib/constants'

interface Props {
  medSpaId?: string
  clientId?: string
  onClose: () => void
}

export function TaskForm({ medSpaId, clientId, onClose }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createTask({
          title:       fd.get('title') as string,
          task_type:   fd.get('task_type') as string,
          priority:    fd.get('priority') as string,
          description: (fd.get('description') as string) || null,
          due_date:    (fd.get('due_date') as string) || null,
          med_spa_id:  medSpaId || null,
          client_id:   clientId || null,
        })
        onClose()
      } catch (err: any) { setError(err.message) }
    })
  }

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-title">New Task</div>
        <form onSubmit={submit}>
          <div className="fld">
            <label className="fld-lbl">Title *</label>
            <input className="inp" name="title" required placeholder="e.g. Send Calendly to Dr. Campos" autoFocus />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="fld">
              <label className="fld-lbl">Type</label>
              <select className="inp" name="task_type" style={{ appearance: 'none' }}>
                {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="fld">
              <label className="fld-lbl">Priority</label>
              <select className="inp" name="priority" style={{ appearance: 'none' }}>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="fld">
            <label className="fld-lbl">Due Date</label>
            <input className="inp" name="due_date" type="date" />
          </div>
          <div className="fld">
            <label className="fld-lbl">Description</label>
            <textarea className="inp-area" name="description" placeholder="Optional details…" rows={2} />
          </div>
          {error && <div style={{ fontSize: 12, color: '#F09090', marginBottom: 12 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={pending} className="btn-gold" style={{ flex: 2 }}>
              {pending ? 'Creating…' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
