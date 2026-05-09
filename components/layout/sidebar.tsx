'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { NAV_GROUPS } from '@/lib/constants'

export function Sidebar({ user }: { user?: { full_name?: string; role?: string } | null }) {
  const pathname = usePathname()
  const router   = useRouter()

  const active = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()
    : 'MK'

  async function signOut() {
    await createClient().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside style={{ width: 204, height: '100vh', background: 'var(--ink3)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, zIndex: 30 }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gold-dim)', border: '1px solid var(--gold-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: 'var(--gold)', fontFamily: 'serif', flexShrink: 0 }}>M</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>mrktrsmedia</div>
            <div style={{ fontSize: 9, color: 'var(--t4)', marginTop: 1 }}>Med Spa CRM</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
        {NAV_GROUPS.map(g => (
          <div key={g.label} style={{ marginBottom: 14 }}>
            <span className="nav-group-label">{g.label}</span>
            {g.items.map(item => (
              <Link key={item.href} href={item.href} className={`nav-link${active(item.href) ? ' active' : ''}`}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: active(item.href) ? 'var(--gold)' : 'currentColor', opacity: active(item.href) ? 1 : 0.3, flexShrink: 0 }} />
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '10px 16px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="avatar round" style={{ width: 26, height: 26, fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name ?? 'Team Member'}</div>
          <div style={{ fontSize: 9, color: 'var(--t3)', textTransform: 'capitalize', marginTop: 1 }}>{user?.role?.replace(/_/g, ' ') ?? 'admin'}</div>
        </div>
        <button onClick={signOut} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t4)', padding: 2, display: 'flex' }} title="Sign out">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </aside>
  )
}
