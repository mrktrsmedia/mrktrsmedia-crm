'use client'
import { useState } from 'react'
import { LogOutreachModal } from '@/components/shared/log-outreach-modal'
import { TaskForm } from '@/components/shared/task-form'

export function MedSpaDetailClient({ medSpaId, medSpaName }: { medSpaId: string; medSpaName: string }) {
  const [showOutreach, setShowOutreach] = useState(false)
  const [showTask, setShowTask] = useState(false)

  return (
    <>
      <button onClick={() => setShowTask(true)} className="btn-ghost btn-sm">+ Task</button>
      <button onClick={() => setShowOutreach(true)} className="btn-gold btn-sm">+ Log Outreach</button>

      {showOutreach && <LogOutreachModal medSpaId={medSpaId} medSpaName={medSpaName} onClose={() => setShowOutreach(false)} />}
      {showTask && <TaskForm medSpaId={medSpaId} onClose={() => setShowTask(false)} />}
    </>
  )
}
