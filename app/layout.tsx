import './globals.css'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: { default: 'mrktrsmedia CRM', template: '%s — mrktrsmedia' }, robots: 'noindex,nofollow' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" style={{ colorScheme:'dark' }}><body>{children}</body></html>)
}
