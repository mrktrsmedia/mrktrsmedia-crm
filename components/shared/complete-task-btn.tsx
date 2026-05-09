'use client'
import { useTransition } from 'react'
import { completeTask } from '@/lib/actions/tasks'

export function CompleteTaskBtn({ taskId }: { taskId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      onClick={() => startTransition(() => completeTask(taskId))}
      disabled={pending}
      className="btn-icon"
      title="Mark complete"
      style={{ width: 24, height: 24, borderRadius: 5, fontSize: 10 }}
    >
      {pending ? '…' : '✓'}
    </button>
  )
}
