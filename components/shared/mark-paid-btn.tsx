'use client'
import { useTransition } from 'react'
import { markPaymentPaid } from '@/lib/actions/clients'

export function MarkPaidBtn({ paymentId, clientId }: { paymentId: string; clientId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      onClick={() => startTransition(() => markPaymentPaid(paymentId, clientId))}
      disabled={pending}
      style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, border: '1px solid var(--gold-line)', background: 'var(--gold-dim)', color: 'var(--gold)', cursor: 'pointer' }}
    >
      {pending ? '…' : 'Mark Paid'}
    </button>
  )
}
