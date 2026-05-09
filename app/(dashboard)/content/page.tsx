import { Topbar } from '@/components/layout/topbar'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Content' }
export default function ContentPage() {
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh'}}>
      <Topbar title="Content" subtitle="Campaign & content management — coming soon" />
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:10}}>
        <div style={{fontSize:32}}>📝</div>
        <div style={{fontSize:14,fontWeight:600,color:'var(--t1)'}}>Content management coming soon</div>
        <div style={{fontSize:12,color:'var(--t3)'}}>Track creatives, copy, and content calendars per client.</div>
      </div>
    </div>
  )
}
