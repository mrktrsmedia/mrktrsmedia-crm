import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { client_id } = await req.json()
    if (!client_id) return NextResponse.json({ error: 'client_id required' }, { status: 400 })

    const sb = createClient()
    const { data: client } = await sb
      .from('clients')
      .select('id,retainer_amount,service_package,start_date,med_spa:med_spas(name),primary_contact:contacts(name,email),account_manager:users!clients_account_manager_id_fkey(full_name,email)')
      .eq('id', client_id)
      .single()

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    const contact = (client as any).primary_contact
    const to = contact?.email
    if (!to) return NextResponse.json({ error: 'No contact email' }, { status: 400 })

    const RESEND_KEY = process.env.RESEND_API_KEY
    if (!RESEND_KEY) return NextResponse.json({ error: 'Resend not configured' }, { status: 500 })

    const spa = (client as any).med_spa
    const am  = (client as any).account_manager

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: 'mrktrsmedia <onboarding@mrktrsmedia.com>',
        to: [to],
        subject: `Welcome to mrktrsmedia — ${spa?.name ?? 'Your Account'} is now active`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0D0D0D;color:#F5F4F0;padding:32px;border-radius:12px">
            <div style="font-size:28px;font-weight:700;color:#C9A86A;margin-bottom:4px">mrktrsmedia</div>
            <div style="font-size:12px;color:#6B6860;margin-bottom:28px">Med spa growth agency</div>
            <h1 style="font-size:20px;font-weight:600;margin-bottom:8px">Welcome, ${contact.name?.split(' ')[0] ?? 'there'} 👋</h1>
            <p style="color:#9E9B92;line-height:1.7">Your account for <strong style="color:#F5F4F0">${spa?.name ?? 'your practice'}</strong> is now active. Here's what we need from you to get started.</p>
            <div style="background:#1A1A1A;border:1px solid #2a2a2a;border-radius:8px;padding:20px;margin:20px 0">
              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6B6860;margin-bottom:14px">Action Required</div>
              ${['Meta Business Manager access', 'Facebook Page admin', 'Instagram account', 'Ad Account (Advertiser role)', 'Pixel / Dataset', 'Brand assets & logo', 'Service menu & pricing'].map(i => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div style="width:16px;height:16px;border-radius:50%;border:2px solid #C9A86A;flex-shrink:0"></div><span style="font-size:13px;color:#9E9B92">${i}</span></div>`).join('')}
            </div>
            <p style="color:#9E9B92;font-size:13px;line-height:1.7">Your account manager <strong style="color:#F5F4F0">${am?.full_name ?? 'our team'}</strong> will be in touch within 24 hours to walk you through everything.</p>
            <div style="margin-top:24px;padding-top:20px;border-top:1px solid #2a2a2a;font-size:11px;color:#46443F">
              mrktrsmedia · Med Spa Growth Agency
            </div>
          </div>
        `,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json({ error: err }, { status: 500 })
    }

    await sb.from('clients').update({ onboarding_email_sent: true, updated_at: new Date().toISOString() }).eq('id', client_id)
    await sb.from('email_logs').insert({ client_id, recipient_email: to, email_type: 'onboarding', status: 'sent', sent_at: new Date().toISOString() })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
