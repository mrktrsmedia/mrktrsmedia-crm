'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await createClient().auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else { router.push('/dashboard'); router.refresh() }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', display: 'flex' }}>
      {/* Left brand panel */}
      <div style={{ width: 300, flexShrink: 0, background: 'var(--ink3)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '40px 32px' }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--gold-dim)', border: '1px solid var(--gold-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 22, fontWeight: 700, color: 'var(--gold)', fontFamily: 'serif' }}>M</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)' }}>mrktrsmedia</div>
        <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 6, lineHeight: 1.6 }}>Med spa marketing CRM.<br/>Agency eyes only.</div>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[{ v: '$5,000+', l: 'Per client retainer' }, { v: '3', l: 'Service bundles' }, { v: '100%', l: 'Calls answered by AI' }].map(s => (
            <div key={s.l} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 7 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold)', fontFamily: 'monospace' }}>{s.v}</div>
              <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 300 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>Sign in</h1>
          <p style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 28 }}>Team members only</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="fld">
              <label className="fld-lbl">Email</label>
              <input className="inp" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@mrktrsmedia.com" required />
            </div>
            <div className="fld">
              <label className="fld-lbl">Password</label>
              <input className="inp" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>

            {error && (
              <div style={{ padding: '10px 12px', background: 'var(--red-dim)', border: '1px solid rgba(224,82,82,0.2)', borderRadius: 7, fontSize: 12, color: '#F09090' }}>{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-gold" style={{ width: '100%', height: 42, fontSize: 14 }}>
              {loading ? 'Signing in…' : 'Sign in to CRM'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
