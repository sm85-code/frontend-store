import { buttonVariants } from '@store/ui'
import Link from 'next/link'
import { LogoMark } from '@/components/Logo'

export default function NotFound() {
  return (
    <div className="mx-auto mt-12 flex max-w-sm flex-col items-center gap-3 text-center">
      <LogoMark className="size-20" />
      <h1 className="text-3xl font-extrabold">Halaman tidak ditemukan</h1>
      <p className="text-muted-foreground">Lampunya masih kuning: tautan ini mungkin sudah berubah. Coba kembali ke beranda dan cari produknya.</p>
      <Link href="/" className={buttonVariants({ size: 'lg', className: 'rounded-lg font-bold' })}>Ke beranda</Link>
    </div>
  )
}
