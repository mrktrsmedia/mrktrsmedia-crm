export function Topbar({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <header style={{ height: 48, background: 'var(--ink3)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0 }}>
      <div>
        <h1 style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', letterSpacing: '-0.2px' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 10, color: 'var(--t3)', marginTop: 1 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{actions}</div>}
    </header>
  )
}
