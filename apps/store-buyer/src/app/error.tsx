'use client'

import { Button, ErrorNotice } from '@store/ui'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto mt-16 max-w-md">
      <ErrorNotice message="Terjadi kesalahan saat memuat halaman." action={<Button size="sm" onClick={reset}>Coba lagi</Button>} />
    </div>
  )
}
