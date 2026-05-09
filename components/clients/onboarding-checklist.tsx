'use client'
import { useTransition } from 'react'
import { toggleOnboardingItem } from '@/lib/actions/clients'

const GROUPS = [
  { title: 'Business Info', emoji: '🏢', items: [
    { key: 'business_info_completed',   label: 'Business info form completed' },
    { key: 'primary_contact_confirmed', label: 'Primary contact confirmed' },
  ]},
  { title: 'Platform Access', emoji: '🔐', items: [
    { key: 'meta_business_manager_received', label: 'Meta Business Manager' },
    { key: 'facebook_page_received',         label: 'Facebook Page' },
    { key: 'instagram_received',             label: 'Instagram account' },
    { key: 'ad_account_received',            label: 'Ad Account (Advertiser)' },
    { key: 'pixel_dataset_received',         label: 'Pixel / Conversions API Dataset' },
    { key: 'website_cms_received',           label: 'Website / CMS access' },
  ]},
  { title: 'Brand Assets', emoji: '🎨', items: [
    { key: 'brand_assets_received',         label: 'Brand assets folder' },
    { key: 'logo_received',                 label: 'Logo files (PNG + SVG)' },
    { key: 'service_menu_received',         label: 'Service menu' },
    { key: 'offer_details_received',        label: 'Current offers & pricing' },
    { key: 'before_after_policy_confirmed', label: 'Before/after photo policy' },
    { key: 'compliance_rules_received',     label: 'Compliance rules' },
  ]},
  { title: 'Process & Kickoff', emoji: '🚀', items: [
    { key: 'approval_workflow_confirmed', label: 'Approval workflow agreed' },
    { key: 'reporting_cadence_confirmed', label: 'Reporting cadence agreed' },
    { key: 'first_strategy_call_booked', label: 'First strategy call booked' },
    { key: 'first_campaign_planned',     label: 'First campaign brief drafted' },
  ]},
]

export const OB_ALL_ITEMS = GROUPS.flatMap(g => g.items)

interface Props {
  clientId: string
  form: Record<string, any> | null
}

export function OnboardingChecklist({ clientId, form }: Props) {
  const [pending, startTransition] = useTransition()

  function toggle(field: string, current: boolean) {
    startTransition(() => toggleOnboardingItem(clientId, field, !current))
  }

  const allItems = OB_ALL_ITEMS
  const doneCount = allItems.filter(i => form?.[i.key] === true).length
  const pct = allItems.length > 0 ? Math.round(doneCount / allItems.length * 100) : 0

  return (
    <div>
      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div className="prog-track" style={{ flex: 1 }}>
          <div className="prog-fill" style={{ width: `${pct}%`, background: pct === 100 ? 'var(--green)' : 'var(--gold)' }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: pct === 100 ? 'var(--green)' : 'var(--gold)', fontFamily: 'monospace', minWidth: 36 }}>{pct}%</span>
        <span style={{ fontSize: 11, color: 'var(--t3)' }}>{doneCount}/{allItems.length}</span>
      </div>

      {GROUPS.map(group => {
        const grpDone = group.items.filter(i => form?.[i.key] === true).length
        return (
          <div key={group.title} className="card" style={{ marginBottom: 8 }}>
            <div className="card-hd">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13 }}>{group.emoji}</span>
                <span className="card-title">{group.title}</span>
              </div>
              <span style={{ fontSize: 11, color: grpDone === group.items.length ? 'var(--green)' : 'var(--t3)', fontFamily: 'monospace' }}>
                {grpDone}/{group.items.length}
              </span>
            </div>
            {group.items.map(item => {
              const done = form?.[item.key] === true
              return (
                <button
                  key={item.key}
                  onClick={() => toggle(item.key, done)}
                  disabled={pending}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '9px 14px',
                    background: done ? 'rgba(61,184,122,0.04)' : 'transparent',
                    border: 'none', borderBottom: '1px solid var(--border)',
                    cursor: pending ? 'wait' : 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%', border: `2px solid ${done ? 'var(--green)' : 'var(--border2)'}`,
                    background: done ? 'var(--green)' : 'transparent', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 9, fontWeight: 700,
                  }}>
                    {done ? '✓' : ''}
                  </div>
                  <span style={{ fontSize: 12, color: done ? 'var(--t3)' : 'var(--t1)', textDecoration: done ? 'line-through' : 'none', flex: 1 }}>
                    {item.label}
                  </span>
                  {!done && <span style={{ fontSize: 9, color: 'var(--amber)', fontWeight: 600 }}>Pending</span>}
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
