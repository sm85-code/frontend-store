'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

interface GoogleId {
  initialize: (config: { client_id: string; callback: (r: { credential: string }) => void }) => void
  renderButton: (el: HTMLElement, options: Record<string, unknown>) => void
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } }
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

/** "Masuk dengan Google" (Google Identity Services). Renders nothing until NEXT_PUBLIC_GOOGLE_CLIENT_ID is set.
 *  The ID token is verified server-side by the backend; this component never sees a password. */
export function GoogleButton({ onCredential }: { onCredential: (idToken: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(typeof window !== 'undefined' && !!window.google)
  const callback = useRef(onCredential)
  callback.current = onCredential

  useEffect(() => {
    if (!CLIENT_ID || !ready || !ref.current || !window.google) return
    window.google.accounts.id.initialize({ client_id: CLIENT_ID, callback: (r) => callback.current(r.credential) })
    window.google.accounts.id.renderButton(ref.current, { theme: 'outline', size: 'large', width: 320, text: 'continue_with', locale: 'id' })
  }, [ready])

  if (!CLIENT_ID) return null
  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={() => setReady(true)} />
      <div ref={ref} className="flex min-h-11 justify-center" />
    </>
  )
}
