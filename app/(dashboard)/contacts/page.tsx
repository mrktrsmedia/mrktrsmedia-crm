import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Contacts' }

export default async function ContactsPage() {
  const sb = createClient()
  const { data: contacts } = await sb
    .from('contacts')
    .select('*,med_spa:med_spas(id,name)')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Topbar title="Contacts" subtitle={`${contacts?.length ?? 0} contacts`} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr><th>Name</th><th>Role</th><th>Med Spa</th><th>Email</th><th>Phone</th><th>Instagram</th><th>DM</th></tr>
          </thead>
          <tbody>
            {(contacts ?? []).map((c: any) => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div className="avatar round" style={{ width: 26, height: 26, fontSize: 9, fontWeight: 700 }}>
                      {c.name?.slice(0, 2).toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--t1)' }}>{c.name}</div>
                      {c.is_decision_maker && <span style={{ fontSize: 9, color: 'var(--gold)' }}>DM</span>}
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: 11, color: 'var(--t2)' }}>{c.role ?? '—'}</td>
                <td>
                  {c.med_spa && (
                    <Link href={`/med-spas/${c.med_spa.id}`} style={{ fontSize: 11, color: 'var(--blue)', textDecoration: 'none' }}>
                      {c.med_spa.name}
                    </Link>
                  )}
                </td>
                <td style={{ fontSize: 11 }}>
                  {c.email ? <a href={`mailto:${c.email}`} style={{ color: 'var(--blue)' }}>{c.email}</a> : '—'}
                </td>
                <td style={{ fontSize: 11, color: 'var(--t2)' }}>{c.phone ?? '—'}</td>
                <td style={{ fontSize: 11 }}>
                  {c.instagram ? (
                    <a href={`https://instagram.com/${c.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#E1306C' }}>{c.instagram}</a>
                  ) : '—'}
                </td>
                <td><span className={`badge ${c.is_decision_maker ? 'b-hot' : 'b-unscored'}`}>{c.is_decision_maker ? 'Decision Maker' : 'Contact'}</span></td>
              </tr>
            ))}
            {(contacts?.length ?? 0) === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--t4)' }}>
                No contacts yet. They are added automatically when you create med spa records with contacts.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
