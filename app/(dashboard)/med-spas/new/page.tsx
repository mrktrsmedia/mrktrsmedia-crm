import { Topbar } from '@/components/layout/topbar'
import { NewMedSpaForm } from '@/components/med-spas/new-med-spa-form'
import Link from 'next/link'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Add Med Spa' }

export default function NewMedSpaPage() {
  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100vh' }}>
      <Topbar
        title="Add Med Spa"
        subtitle="Add a new lead to your prospect database"
        actions={<Link href="/med-spas"><button className="btn-ghost btn-sm">← Back</button></Link>}
      />
      <div style={{ flex:1,overflowY:'auto',padding:'20px',maxWidth:600 }}>
        <NewMedSpaForm />
      </div>
    </div>
  )
}
