'use client'
import { useState } from 'react'
import { TaskForm } from '@/components/shared/task-form'

export function TasksPageClient() {
  const [show, setShow] = useState(false)
  return (
    <>
      <button onClick={() => setShow(true)} className="btn-gold btn-sm">+ New Task</button>
      {show && <TaskForm onClose={() => setShow(false)} />}
    </>
  )
}
