'use client'

import dynamic from 'next/dynamic'

// Dynamic import with ssr:false must live in a Client Component.
// page.tsx is a Server Component, so the dynamic() call lives here instead.
const SignalFieldClient = dynamic(
  () => import('./SignalField').then((m) => m.SignalField),
  { ssr: false }
)

export function SignalFieldWrapper() {
  return <SignalFieldClient />
}
