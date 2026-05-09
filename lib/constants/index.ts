// ─── Service Packages ──────────────────────────────────────────────────────

export const SERVICE_PACKAGES = [
  {
    id: 'bundle',
    name: 'Full Bundle',
    setup_fee: 6000,
    retainer: 5000,
    description: 'Complete patient acquisition system',
    includes: [
      {
        name: 'New Patient Acquisition',
        desc: 'Our team puts a strategy in place to take complete strangers to pre-qualified new patient appointments in your calendar.',
      },
      {
        name: 'Office Staff Training',
        desc: 'We train your staff to operate at 100% efficiency. Master software tools, learn proven methods for handling insurance claims, and streamline office coordination.',
      },
      {
        name: 'AI Voice Agents',
        desc: '1000s of leads coming, 1000s of calls, not everyone will be answered — but we will make every call answered. 24/7 intelligent patient engagement.',
      },
    ],
  },
]

export const UPSELL_SERVICES = [
  {
    id: 'personal_branding',
    name: 'Personal Branding',
    addon_price: 1000,
    desc: 'Become the most trusted expert in your community through educational and personalized video content and a high volume of high-quality patient reviews.',
  },
  {
    id: 'call_center',
    name: 'Call Center',
    addon_price: 1000,
    desc: 'A trained appointment setting team that will work even in the after hours and manage no-shows, follow-ups, reminders and cancellations.',
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    addon_price: 1000,
    desc: 'We do not sell marketing services. We build patient acquisition infrastructure that acts as the backbone of your spa\'s scale.',
  },
]

// ─── Pipeline stages ───────────────────────────────────────────────────────

export const PIPELINE_STAGES = [
  { key: 'new_lead',       label: 'New Lead',       color: '#6B7280' },
  { key: 'contacted',      label: 'Contacted',      color: '#3B82F6' },
  { key: 'media_sent',     label: 'Media Sent',     color: '#F59E0B' },
  { key: 'engaged',        label: 'Engaged',        color: '#EF4444' },
  { key: 'calendly_sent',  label: 'Calendly Sent',  color: '#8B5CF6' },
  { key: 'call_booked',    label: 'Call Booked',    color: '#10B981' },
  { key: 'proposal_sent',  label: 'Proposal Sent',  color: '#C9A86A' },
  { key: 'won',            label: 'Won',            color: '#16A34A' },
]

// ─── Status / quality label maps ───────────────────────────────────────────

export const MED_SPA_STATUS_LABELS: Record<string, string> = {
  lead: 'Lead', prospect: 'Prospect', booked: 'Call Booked',
  client: 'Client', lost: 'Lost', nurture: 'Nurture',
}

export const LEAD_QUALITY_LABELS: Record<string, string> = {
  unscored: 'Unscored', low: 'Low', medium: 'Medium', high: 'High', hot: 'Hot 🔥',
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', paid: 'Paid', overdue: 'Overdue',
  failed: 'Failed', refunded: 'Refunded', cancelled: 'Cancelled',
}

export const OUTREACH_CHANNELS = [
  { value: 'instagram_dm', label: 'Instagram DM' },
  { value: 'cold_email',   label: 'Cold Email' },
  { value: 'cold_call',    label: 'Cold Call' },
  { value: 'linkedin',     label: 'LinkedIn' },
  { value: 'whatsapp',     label: 'WhatsApp' },
  { value: 'voicemail',    label: 'Voicemail' },
]

export const OUTREACH_STAGES = [
  { value: 'initiated',     label: 'Initiated' },
  { value: 'media_seen',    label: 'Media Seen' },
  { value: 'engaged',       label: 'Engaged' },
  { value: 'calendly_sent', label: 'Calendly Sent' },
  { value: 'booked',        label: 'Call Booked' },
  { value: 'follow_up',     label: 'Follow Up' },
  { value: 'closed',        label: 'Closed' },
]

export const TASK_TYPES = [
  { value: 'follow_up',   label: 'Follow Up' },
  { value: 'call',        label: 'Call' },
  { value: 'audit',       label: 'Audit' },
  { value: 'proposal',    label: 'Proposal' },
  { value: 'onboarding',  label: 'Onboarding' },
  { value: 'campaign',    label: 'Campaign' },
  { value: 'payment',     label: 'Payment' },
  { value: 'reporting',   label: 'Reporting' },
  { value: 'internal',    label: 'Internal' },
]

export const USER_ROLES = [
  { value: 'admin',           label: 'Admin' },
  { value: 'account_manager', label: 'Account Manager' },
  { value: 'media_buyer',     label: 'Media Buyer' },
  { value: 'copywriter',      label: 'Copywriter' },
  { value: 'strategist',      label: 'Strategist' },
  { value: 'client_success',  label: 'Client Success' },
  { value: 'viewer',          label: 'Viewer' },
]

export const NAV_GROUPS = [
  { label: 'Prospecting', items: [
    { label: 'Dashboard',       href: '/dashboard' },
    { label: 'Med Spas',        href: '/med-spas' },
    { label: 'Pipeline',        href: '/pipeline' },
    { label: 'Contacts',        href: '/contacts' },
  ]},
  { label: 'Outreach', items: [
    { label: 'Outreach Log',    href: '/outreach' },
    { label: 'Cold DM Metrics', href: '/cold-dm-metrics' },
    { label: 'Tasks',           href: '/tasks' },
    { label: 'Audits',          href: '/audits' },
  ]},
  { label: 'Clients', items: [
    { label: 'Clients',         href: '/clients' },
    { label: 'Finance',         href: '/finance' },
  ]},
  { label: 'Ops', items: [
    { label: 'Meetings',        href: '/meetings' },
    { label: 'Reports',         href: '/reports' },
    { label: 'Settings',        href: '/settings' },
  ]},
]
