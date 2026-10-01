import { ArrowRight, MessageCircle, PackageCheck, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { LogoMark } from '@/components/Logo'

const PERKS = [
  { icon: ShieldCheck, text: 'Masuk dengan Google, checkout cepat' },
  { icon: MessageCircle, text: 'Chat langsung dengan penjual' },
  { icon: PackageCheck, text: 'Pantau status pesanan kapan saja' },
]

export function Hero() {
  return (
    <section className="hero rounded-3xl px-5 py-7 sm:px-9 sm:py-11" aria-labelledby="judul-hero">
      <div className="flex items-center justify-between gap-6">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/55 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur dark:bg-black/25">
            <span className="size-1.5 rounded-full bg-[oklch(0.68_0.18_150)]" aria-hidden /> Toko online
          </p>
          <h1 id="judul-hero" className="mt-3 text-[1.75rem] font-extrabold leading-tight sm:text-4xl">
            Belanja santai, <br className="sm:hidden" />
            harga bersahabat.
          </h1>
          <p className="mt-2 max-w-md text-sm font-medium opacity-80 sm:text-base">
            Pilih produk favorit Anda, masukkan keranjang, dan pesan dalam hitungan detik.
          </p>
          <a
            href="#produk"
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-bold text-background shadow-[var(--shadow-lift)] transition active:scale-95"
          >
            Mulai belanja <ArrowRight className="size-4" aria-hidden />
          </a>
          <ul className="mt-5 grid gap-1.5 text-xs font-semibold sm:grid-cols-3 sm:gap-3 sm:text-[0.8rem]">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-1.5">
                <Icon className="size-4 shrink-0" aria-hidden /> {text}
              </li>
            ))}
          </ul>
        </div>
        <LogoMark className="hidden size-40 shrink-0 rotate-6 drop-shadow-xl sm:block" />
      </div>
    </section>
  )
}

export function KategoriRail({ kategori, aktif, q }: { kategori: { id: string; nama: string }[]; aktif?: string; q?: string }) {
  if (kategori.length === 0) return null
  const chip = (on: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-95 ${
      on ? 'border-primary bg-primary text-primary-foreground shadow-[var(--shadow-card)]' : 'bg-card hover:bg-muted'
    }`
  return (
    <nav aria-label="Kategori" className="scroll-x -mx-4 px-4 sm:mx-0 sm:px-0">
      <Link href={q ? `/?q=${encodeURIComponent(q)}#produk` : '/#produk'} className={chip(!aktif)}>
        Semua
      </Link>
      {kategori.map((k) => (
        <Link key={k.id} href={`/?kategori=${k.id}${q ? `&q=${encodeURIComponent(q)}` : ''}#produk`} className={chip(aktif === k.id)}>
          {k.nama}
        </Link>
      ))}
    </nav>
  )
}
