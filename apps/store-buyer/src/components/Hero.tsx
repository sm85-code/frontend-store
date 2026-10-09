import { getKontak } from '@/lib/kontak'
import { ArrowRight, MessageCircle, PackageCheck, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { LogoMark } from '@/components/Logo'

const PERKS = [
  { icon: ShieldCheck, title: 'Masuk dengan Google', text: 'Checkout cepat tanpa daftar panjang.' },
  { icon: MessageCircle, title: 'Chat dengan penjual', text: 'Tanya stok dan ukuran sebelum membeli.' },
  { icon: PackageCheck, title: 'Pantau pesanan', text: 'Status pesanan bisa dilihat kapan saja.' },
]

export async function Hero() {
  const { KONTAK } = await getKontak()
  return (
    <section className="hero rounded-xl" aria-labelledby="judul-hero">
      <div className="grid md:grid-cols-[1.25fr_1fr]">
        <div className="px-6 py-8 sm:px-10 sm:py-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{KONTAK.nama}</p>
          <h1 id="judul-hero" className="font-display mt-3 text-[2rem] leading-[1.1] sm:text-5xl">
            Belanja santai, harga bersahabat.
          </h1>
          <p className="prose-id mt-4 max-w-md text-[0.95rem] text-muted-foreground">
            Pilih produk favorit Anda, masukkan keranjang, lalu pesan dalam hitungan detik. Setiap pesanan bisa dipantau dari awal sampai tiba.
          </p>
          <a
            href="#produk"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-foreground px-6 text-sm font-bold text-background transition active:scale-[0.98]"
          >
            Mulai belanja <ArrowRight className="size-4" aria-hidden />
          </a>
        </div>
        <div className="hero-panel hidden place-items-center p-8 md:grid" aria-hidden>
          <LogoMark className="h-56 w-auto" />
        </div>
      </div>
      <ul className="grid divide-y border-t sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {PERKS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3 px-6 py-4 sm:px-6">
            <Icon className="mt-0.5 size-5 shrink-0 text-[var(--brand-orange)]" aria-hidden />
            <div>
              <p className="text-sm font-bold">{title}</p>
              <p className="text-xs text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function KategoriRail({ kategori, aktif, q }: { kategori: { id: string; nama: string }[]; aktif?: string; q?: string }) {
  if (kategori.length === 0) return null
  const chip = (on: boolean) =>
    `rounded-md border px-3.5 py-2 text-sm font-semibold transition active:scale-[0.97] ${
      on ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:border-primary'
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
