import Link from 'next/link'
import { Logo } from '@/components/Logo'

export function Footer() {
  return (
    <footer className="mt-10 border-t bg-card">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm sm:grid-cols-[1.3fr_1fr] sm:px-6">
        <div>
          <Logo />
          <p className="prose-id mt-3 max-w-sm text-muted-foreground">
            Belanja produk pilihan dengan mudah: masuk dengan Google, simpan alamat, dan pantau pesanan Anda di satu tempat.
          </p>
        </div>
        <nav aria-label="Tautan" className="grid grid-cols-2 gap-2 text-muted-foreground sm:justify-items-end">
          <Link href="/" className="hover:text-foreground">Beranda</Link>
          <Link href="/pesanan" className="hover:text-foreground">Pesanan saya</Link>
          <Link href="/chat" className="hover:text-foreground">Chat penjual</Link>
          <Link href="/kebijakan-privasi" className="hover:text-foreground">Kebijakan Privasi</Link>
        </nav>
      </div>
      <p className="border-t px-4 py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Ampelkuning. Semua hak dilindungi.</p>
    </footer>
  )
}
