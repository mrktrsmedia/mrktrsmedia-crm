import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Meetings' }

export default async function MeetingsPage() {
  const sb = createClient()
  const { data: tasks } = await sb.from('tasks').select('*,med_spa:med_spas(name),assigned:users(full_name)').eq('task_type','call').in('status',['pending','in_progress']).order('due_date')
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh'}}>
      <Topbar title="Meetings & Calls" subtitle="Upcoming calls from tasks" />
      <div style={{flex:1,overflowY:'auto'}}>
        <table className="tbl">
          <thead><tr><th>Title</th><th>Med Spa</th><th>Assigned</th><th>Priority</th><th>Due Date</th></tr></thead>
          <tbody>
            {(tasks??[]).map((t:any)=>(
              <tr key={t.id}>
                <td style={{fontWeight:500,color:'var(--t1)'}}>{t.title}</td>
                <td style={{fontSize:11,color:'var(--t2)'}}>{t.med_spa?.name??'—'}</td>
                <td style={{fontSize:11,color:'var(--t2)'}}>{t.assigned?.full_name??'Unassigned'}</td>
                <td><span className={`badge b-${t.priority}`}>{t.priority}</span></td>
                <td style={{fontSize:11,fontFamily:'monospace',color:'var(--t3)'}}>{t.due_date?new Date(t.due_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'—'}</td>
              </tr>
            ))}
            {(tasks?.length??0)===0&&<tr><td colSpan={5} style={{textAlign:'center',padding:32,color:'var(--t4)'}}>No calls scheduled. Create tasks with type "Call" on the Tasks page.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
