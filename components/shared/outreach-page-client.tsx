'use client'
import { useState } from 'react'
import { LogOutreachModal } from '@/components/shared/log-outreach-modal'

export function OutreachPageClient({ medSpas }: { medSpas: {id:string;name:string}[] }) {
  const [showModal, setShowModal] = useState(false)
  const [selectedSpa, setSelectedSpa] = useState<{id:string;name:string}|null>(null)

  function handleLog() {
    if (medSpas.length === 0) {
      alert('Add a med spa first before logging outreach.')
      return
    }
    // Use first med spa as default; user can change in the modal
    setSelectedSpa(medSpas[0])
    setShowModal(true)
  }

  return (
    <>
      <div style={{ display:'flex',gap:8,alignItems:'center' }}>
        <select
          onChange={e => {
            const spa = medSpas.find(s=>s.id===e.target.value)
            if (spa) setSelectedSpa(spa)
          }}
          style={{ height:32,padding:'0 10px',borderRadius:6,background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--t1)',fontSize:11,appearance:'none' }}
        >
          <option value="">Select med spa…</option>
          {medSpas.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button onClick={handleLog} className="btn-gold btn-sm">+ Log Outreach</button>
      </div>

      {showModal && selectedSpa && (
        <LogOutreachModal
          medSpaId={selectedSpa.id}
          medSpaName={selectedSpa.name}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
