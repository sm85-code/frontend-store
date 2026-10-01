import { buttonVariants } from '@store/ui'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto mt-16 flex max-w-sm flex-col items-center gap-3 text-center">
      <p className="text-5xl font-bold">404</p>
      <p className="text-muted-foreground">Halaman tidak ditemukan.</p>
      <Link href="/" className={buttonVariants()}>Ke beranda</Link>
    </div>
  )
}
