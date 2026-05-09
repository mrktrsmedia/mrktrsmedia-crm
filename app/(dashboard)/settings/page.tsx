import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const sb = createClient()
  const { data: users } = await sb.from('users').select('id,full_name,email,role,is_active').order('full_name')
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh'}}>
      <Topbar title="Settings" subtitle="Team members & account settings" />
      <div style={{flex:1,overflowY:'auto',padding:'16px 20px',display:'flex',flexDirection:'column',gap:14}}>
        <div className="card">
          <div className="card-hd">
            <div><div className="card-title">Team Members</div><div className="card-sub">Add members via Supabase Auth → Users, then INSERT into users table</div></div>
          </div>
          <table className="tbl">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
            <tbody>
              {(users??[]).map((u:any)=>(
                <tr key={u.id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div className="avatar round" style={{width:28,height:28,fontSize:10,fontWeight:700}}>{u.full_name?.slice(0,2).toUpperCase()}</div>
                      <span style={{fontWeight:500,color:'var(--t1)'}}>{u.full_name}</span>
                    </div>
                  </td>
                  <td style={{fontSize:11,color:'var(--t2)'}}>{u.email}</td>
                  <td><span className="badge b-gold" style={{textTransform:'capitalize'}}>{u.role?.replace(/_/g,' ')}</span></td>
                  <td><span className={`badge ${u.is_active?'b-active':'b-lost'}`}>{u.is_active?'Active':'Inactive'}</span></td>
                </tr>
              ))}
              {(users?.length??0)===0&&<tr><td colSpan={4} style={{textAlign:'center',padding:24,color:'var(--t4)'}}>No team members yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-hd"><div className="card-title">How to add team members</div></div>
          <div style={{padding:'12px 14px',fontSize:12,color:'var(--t2)',lineHeight:1.8}}>
            <div>1. Go to <strong style={{color:'var(--t1)'}}>Supabase Dashboard → Authentication → Users → Add user</strong></div>
            <div>2. Enter their email + set a password → Create → copy their UUID</div>
            <div>3. Go to <strong style={{color:'var(--t1)'}}>SQL Editor</strong> and run:</div>
            <pre style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:6,padding:'10px 12px',marginTop:8,fontSize:11,color:'var(--gold)',overflowX:'auto'}}>{`INSERT INTO users (id, email, full_name, role)\nVALUES ('their-uuid', 'email@mrktrsmedia.com', 'Full Name', 'account_manager');`}</pre>
            <div style={{marginTop:8}}>Valid roles: admin, account_manager, media_buyer, copywriter, strategist, client_success, viewer</div>
          </div>
        </div>
      </div>
    </div>
  )
}
