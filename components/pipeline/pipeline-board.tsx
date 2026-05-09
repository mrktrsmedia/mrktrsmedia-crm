'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { updateMedSpaStage } from '@/lib/actions/med-spas'
import { PIPELINE_STAGES } from '@/lib/constants'

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n)

interface Spa {
  id: string; name: string; city: string|null; state: string|null
  pipeline_stage: string; lead_quality: string; estimated_retainer_value: number|null
  is_hot_lead: boolean; last_contacted_at: string|null
}

export function PipelineBoard({ initialSpas }: { initialSpas: Spa[] }) {
  const [spas, setSpas] = useState<Spa[]>(initialSpas)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const byStage = (stage: string) => spas.filter(s => s.pipeline_stage === stage)

  function handleDragStart(e: React.DragEvent, spaId: string) {
    setDragging(spaId)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent, stage: string) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(stage)
  }

  function handleDrop(e: React.DragEvent, newStage: string) {
    e.preventDefault()
    setDragOver(null)
    if (!dragging) return
    const spa = spas.find(s => s.id === dragging)
    if (!spa || spa.pipeline_stage === newStage) { setDragging(null); return }

    // Optimistic update
    setSpas(prev => prev.map(s => s.id === dragging ? { ...s, pipeline_stage: newStage } : s))
    setDragging(null)

    // Persist to DB
    startTransition(async () => {
      try { await updateMedSpaStage(dragging, newStage) }
      catch { /* revert on error */
        setSpas(prev => prev.map(s => s.id === dragging ? { ...s, pipeline_stage: spa.pipeline_stage } : s))
      }
    })
  }

  const QCOLOR: Record<string, string> = { hot: '#F09090', high: 'var(--amber)', medium: 'var(--blue)', low: 'var(--t4)', unscored: 'var(--t4)' }

  return (
    <div style={{ display: 'flex', gap: 0, height: '100%', overflowX: 'auto', padding: '12px 16px', paddingBottom: 0 }}>
      {PIPELINE_STAGES.map(stage => {
        const cards = byStage(stage.key)
        const isDragTarget = dragOver === stage.key
        return (
          <div
            key={stage.key}
            onDragOver={e => handleDragOver(e, stage.key)}
            onDragLeave={() => setDragOver(null)}
            onDrop={e => handleDrop(e, stage.key)}
            style={{
              width: 200, flexShrink: 0, marginRight: 8,
              display: 'flex', flexDirection: 'column',
              background: isDragTarget ? 'rgba(201,168,106,0.06)' : 'var(--surface)',
              border: `1px solid ${isDragTarget ? 'var(--gold-line)' : 'var(--border)'}`,
              borderRadius: 8, overflow: 'hidden',
              transition: 'background 0.1s, border-color 0.1s',
            }}
          >
            {/* Column header */}
            <div style={{
              padding: '10px 12px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--surface2)', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: stage.color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  {stage.label}
                </span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', fontFamily: 'monospace' }}>{cards.length}</span>
            </div>

            {/* Cards */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
              {cards.map(spa => (
                <div
                  key={spa.id}
                  draggable
                  onDragStart={e => handleDragStart(e, spa.id)}
                  onDragEnd={() => setDragging(null)}
                  style={{
                    background: dragging === spa.id ? 'rgba(201,168,106,0.08)' : 'var(--ink3)',
                    border: `1px solid ${dragging === spa.id ? 'var(--gold-line)' : 'var(--border)'}`,
                    borderRadius: 7, padding: '9px 10px', marginBottom: 6,
                    cursor: 'grab', opacity: dragging === spa.id ? 0.7 : 1,
                    transition: 'opacity 0.1s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4, marginBottom: 5 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t1)', lineHeight: 1.3, flex: 1 }}>
                      {spa.name}{spa.is_hot_lead ? ' 🔥' : ''}
                    </div>
                    <Link href={`/med-spas/${spa.id}`} onClick={e => e.stopPropagation()}>
                      <span style={{ fontSize: 10, color: 'var(--t4)', cursor: 'pointer' }}>↗</span>
                    </Link>
                  </div>
                  {spa.city && <div style={{ fontSize: 10, color: 'var(--t4)', marginBottom: 5 }}>{spa.city}{spa.state ? `, ${spa.state}` : ''}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: QCOLOR[spa.lead_quality] ?? 'var(--t4)', textTransform: 'capitalize', fontWeight: 500 }}>
                      {spa.lead_quality}
                    </span>
                    {spa.estimated_retainer_value && (
                      <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--gold)', fontWeight: 600 }}>
                        {fmt(spa.estimated_retainer_value)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {cards.length === 0 && (
                <div style={{ padding: '20px 8px', textAlign: 'center', fontSize: 11, color: 'var(--t4)' }}>
                  Drop here
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
