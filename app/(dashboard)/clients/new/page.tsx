import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import { NewClientForm } from '@/components/clients/new-client-form'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New Client' }

export default async function NewClientPage({ searchParams }: { searchParams: { med_spa_id?: string } }) {
  const sb = createClient()
  const [{ data: medSpas }, { data: users }, { data: contacts }] = await Promise.all([
    sb.from('med_spas').select('id,name,city,state').eq('is_archived',false).order('name'),
    sb.from('users').select('id,full_name,role').eq('is_active',true).order('full_name'),
    sb.from('contacts').select('id,name,med_spa_id').order('name'),
  ])

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100vh' }}>
      <Topbar
        title="Convert to Client"
        subtitle="Create a new client account"
        actions={<Link href="/clients"><button className="btn-ghost btn-sm">← Cancel</button></Link>}
      />
      <div style={{ flex:1,overflowY:'auto',padding:'20px',maxWidth:640 }}>
        <NewClientForm medSpas={medSpas??[]} users={users??[]} contacts={contacts??[]} />
      </div>
    </div>
  )
}
