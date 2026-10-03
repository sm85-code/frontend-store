import { Clock, Mail, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Logo } from '@/components/Logo'
import { KONTAK, WA_LINK } from '@/lib/kontak'

const tautan = 'inline-flex min-h-9 items-center rounded text-foreground/75 underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

function Kolom({ judul, children }: { judul: string; children: ReactNode }) {
  return (
    <nav aria-label={judul}>
      <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">{judul}</p>
      <ul className="flex flex-col">{children}</ul>
    </nav>
  )
}

function Item({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link href={href} className={tautan}>
        {children}
      </Link>
    </li>
  )
}

export function Footer() {
  return (
    <footer className="mt-10 border-t bg-card pb-[calc(9rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-9 text-sm sm:px-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)] md:gap-12">
        <div>
          <Logo />
          <p className="prose-id mt-3 text-muted-foreground md:max-w-sm">
            Belanja produk pilihan dengan mudah: masuk dengan Google, simpan alamat, dan pantau pesanan Anda di satu tempat.
          </p>
          <address className="mt-4 flex flex-col not-italic">
            <a href={`mailto:${KONTAK.email}`} className={`${tautan} gap-2.5 break-all`}>
              <Mail className="size-4 shrink-0 text-[var(--brand-orange)]" aria-hidden />
              {KONTAK.email}
            </a>
            <a href={WA_LINK} rel="noopener noreferrer" target="_blank" className={`${tautan} gap-2.5`}>
              <MessageCircle className="size-4 shrink-0 text-[var(--brand-orange)]" aria-hidden />
              WhatsApp {KONTAK.telepon}
            </a>
            <p className="flex min-h-9 items-center gap-2.5 text-foreground/75">
              <Clock className="size-4 shrink-0 text-[var(--brand-orange)]" aria-hidden />
              {KONTAK.jam}
            </p>
          </address>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3">
          <Kolom judul="Belanja">
            <Item href="/">Beranda</Item>
            <Item href="/pesanan">Pesanan saya</Item>
            <Item href="/cara-berbelanja">Cara Berbelanja</Item>
          </Kolom>
          <Kolom judul="Bantuan">
            <Item href="/chat">Chat penjual</Item>
            <Item href="/faq">FAQ</Item>
            <Item href="/kontak">Kontak</Item>
          </Kolom>
          <div className="col-span-2 sm:col-span-1">
            <Kolom judul="Kebijakan">
              <Item href="/syarat-ketentuan">Syarat &amp; Ketentuan</Item>
              <Item href="/refund-policy">Refund Policy</Item>
              <Item href="/kebijakan-privasi">Kebijakan Privasi</Item>
            </Kolom>
          </div>
        </div>
      </div>
      <p className="border-t px-4 py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} AmpelKuning. All rights reserved.</p>
    </footer>
  )
}
