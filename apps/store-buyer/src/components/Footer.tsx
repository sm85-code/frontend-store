import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { KONTAK, WA_LINK } from '@/lib/kontak'

export function Footer() {
  return (
    <footer className="mt-10 border-t bg-card pb-[calc(9rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 text-sm sm:px-6 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="prose-id mt-3 text-muted-foreground sm:max-w-sm">
            Belanja produk pilihan dengan mudah: masuk dengan Google, simpan alamat, dan pantau pesanan Anda di satu tempat.
          </p>
          <address className="mt-4 flex flex-col gap-1 not-italic text-muted-foreground">
            <a href={`mailto:${KONTAK.email}`} className="hover:text-foreground">{KONTAK.email}</a>
            <a href={WA_LINK} className="hover:text-foreground" rel="noopener noreferrer" target="_blank">WhatsApp {KONTAK.telepon}</a>
            <span>{KONTAK.jam}</span>
          </address>
        </div>
        <nav aria-label="Belanja" className="flex flex-col gap-2 text-muted-foreground">
          <p className="font-bold text-foreground">Belanja</p>
          <Link href="/" className="hover:text-foreground">Beranda</Link>
          <Link href="/pesanan" className="hover:text-foreground">Pesanan saya</Link>
          <Link href="/chat" className="hover:text-foreground">Chat penjual</Link>
          <Link href="/cara-berbelanja" className="hover:text-foreground">Cara Berbelanja</Link>
          <Link href="/faq" className="hover:text-foreground">FAQ</Link>
        </nav>
        <nav aria-label="Informasi" className="flex flex-col gap-2 text-muted-foreground">
          <p className="font-bold text-foreground">Informasi</p>
          <Link href="/syarat-ketentuan" className="hover:text-foreground">Syarat &amp; Ketentuan</Link>
          <Link href="/refund-policy" className="hover:text-foreground">Refund Policy</Link>
          <Link href="/kebijakan-privasi" className="hover:text-foreground">Kebijakan Privasi</Link>
          <Link href="/kontak" className="hover:text-foreground">Kontak</Link>
        </nav>
      </div>
      <p className="border-t px-4 py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} AmpelKuning. All rights reserved.</p>
    </footer>
  )
}
