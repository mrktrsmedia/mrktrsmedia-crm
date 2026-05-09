import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')
  const { data: user } = await supabase.from('users').select('id,full_name,role').eq('id', authUser.id).single()
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--ink)' }}>
      <Sidebar user={user} />
      <main style={{ flex: 1, marginLeft: 204, overflowY: 'auto', background: 'var(--ink)', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
