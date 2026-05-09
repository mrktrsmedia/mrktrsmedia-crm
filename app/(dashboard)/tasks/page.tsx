import { createClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/layout/topbar'
import { CompleteTaskBtn } from '@/components/shared/complete-task-btn'
import { TasksPageClient } from '@/components/shared/tasks-page-client'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Tasks' }

export default async function TasksPage({ searchParams }: { searchParams: { done?: string } }) {
  const sb   = createClient()
  const done = searchParams.done === 'true'
  const now  = new Date()

  const { data: tasks } = await sb
    .from('tasks')
    .select('*,med_spa:med_spas(name),client:clients(med_spa:med_spas(name)),assigned:users(full_name)')
    .in('status', done ? ['completed'] : ['pending','in_progress'])
    .order(done ? 'completed_at' : 'due_date', {ascending: done ? false : true})
    .limit(100)

  const overdueCnt = tasks?.filter(t=>{
    const d=t.due_date?new Date(t.due_date):null
    return d&&d<now&&t.status!=='completed'
  }).length??0

  const DOT: Record<string,string> = { urgent:'var(--red)', high:'var(--amber)', medium:'var(--blue)', low:'var(--t4)' }

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100vh' }}>
      <Topbar
        title="Tasks"
        subtitle={`${tasks?.length??0} ${done?'completed':'open'}`}
        actions={<TasksPageClient />}
      />

      <div style={{ display:'flex',alignItems:'center',gap:4,padding:'10px 20px',borderBottom:'1px solid var(--border)',flexShrink:0,background:'var(--ink3)' }}>
        <a href="/tasks"><button className={`ftab${!done?' on':''}`}>Open ({overdueCnt>0?`${overdueCnt} overdue`:''})</button></a>
        <a href="/tasks?done=true"><button className={`ftab${done?' on':''}`}>Completed</button></a>
      </div>

      {overdueCnt>0&&!done&&(
        <div className="alert-red" style={{ margin:'12px 20px 0',borderRadius:7 }}>
          <div style={{ width:6,height:6,borderRadius:'50%',background:'var(--red)',flexShrink:0 }}/>
          <span>{overdueCnt} task{overdueCnt>1?'s':''} overdue</span>
        </div>
      )}

      <div style={{ flex:1,overflowY:'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width:30 }}></th>
              <th>Task</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Med Spa / Client</th>
              <th>Assigned</th>
              <th style={{ textAlign:'right' }}>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {(tasks??[]).map((t:any)=>{
              const due=t.due_date?new Date(t.due_date):null
              const ov=due&&due<now&&!done
              return (
                <tr key={t.id}>
                  <td style={{ textAlign:'center',padding:'6px 8px' }}>
                    {!done && <CompleteTaskBtn taskId={t.id} />}
                    {done && <span style={{ color:'var(--green)',fontSize:14 }}>✓</span>}
                  </td>
                  <td>
                    <div style={{ display:'flex',alignItems:'center',gap:7 }}>
                      <div style={{ width:5,height:5,borderRadius:'50%',background:DOT[t.priority]??'var(--t4)',flexShrink:0 }}/>
                      <span style={{ fontWeight:500,color:done?'var(--t3)':'var(--t1)',textDecoration:done?'line-through':undefined }}>{t.title}</span>
                    </div>
                    {t.description&&<div style={{ fontSize:10,color:'var(--t3)',marginTop:2,marginLeft:12 }}>{t.description}</div>}
                  </td>
                  <td><span style={{ fontSize:10,padding:'2px 6px',borderRadius:3,background:'var(--surface2)',color:'var(--t3)',textTransform:'capitalize' }}>{t.task_type?.replace(/_/g,' ')}</span></td>
                  <td><span className={`badge b-${t.priority}`}>{t.priority}</span></td>
                  <td style={{ fontSize:11,color:'var(--t2)' }}>{t.med_spa?.name??t.client?.med_spa?.name??'—'}</td>
                  <td style={{ fontSize:11,color:'var(--t3)' }}>{t.assigned?.full_name??'Unassigned'}</td>
                  <td style={{ textAlign:'right',fontFamily:'monospace',fontSize:11,color:ov?'var(--red)':'var(--t3)',fontWeight:ov?600:undefined }}>
                    {due?due.toLocaleDateString('en-US',{month:'short',day:'numeric'}):'—'}{ov?' ⚠':''}
                  </td>
                </tr>
              )
            })}
            {(tasks?.length??0)===0&&(
              <tr><td colSpan={7} style={{ textAlign:'center',padding:32,color:'var(--t4)' }}>
                {done?'No completed tasks yet.':'No open tasks. Click "+ New Task" to create one.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
