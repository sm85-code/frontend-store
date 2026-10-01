import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthForms } from './AuthForms'

export const metadata: Metadata = { title: 'Masuk', robots: { index: false } }

export default function MasukPage() {
  return (
    <Suspense>
      <AuthForms />
    </Suspense>
  )
}
