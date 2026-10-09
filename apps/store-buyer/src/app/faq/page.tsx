import { ChevronDown } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Bagian, Halaman } from '@/components/Halaman'
import { KONTAK } from '@/lib/kontak'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Pertanyaan yang sering diajukan tentang pemesanan, pembayaran, pengiriman, pre-order, varian, dan retur di AmpelKuning.',
  alternates: { canonical: '/faq' },
}

interface Tanya {
  q: string
  /** Plain text, used for the page and for search-engine markup. */
  a: string
  /** Optional richer answer (with links); falls back to `a`. */
  isi?: ReactNode
}
interface Kelompok {
  judul: string
  daftar: Tanya[]
}

const FAQ: Kelompok[] = [
  {
    judul: 'Pemesanan',
    daftar: [
      { q: 'Bagaimana cara memesan?', a: 'Pilih produk, pilih varian bila ada, tambahkan ke keranjang, masuk dengan Google, isi alamat, lalu checkout dan bayar. Langkah lengkapnya ada di halaman Cara Berbelanja.', isi: <>Pilih produk, pilih varian bila ada, tambahkan ke keranjang, masuk dengan Google, isi alamat, lalu checkout dan bayar. Langkah lengkapnya ada di <Link className="underline" href="/cara-berbelanja">Cara Berbelanja</Link>.</> },
      { q: 'Apakah harus punya akun?', a: 'Ya. Anda masuk dengan akun Google, jadi tidak perlu membuat password baru. Akun dipakai untuk menyimpan alamat dan memantau pesanan.' },
      { q: 'Bisakah saya mengubah atau membatalkan pesanan?', a: 'Bisa selama pesanan belum diproses atau dikirim. Hubungi kami secepatnya lewat Chat atau WhatsApp. Setelah barang dikirim, pesanan tidak dapat dibatalkan.' },
      { q: 'Apa itu varian?', a: 'Varian adalah pilihan dari satu produk, misalnya ukuran atau warna. Harga dan stok bisa berbeda tiap varian. Pilih salah satu varian sebelum menambahkan ke keranjang.' },
    ],
  },
  {
    judul: 'Pembayaran',
    daftar: [
      { q: 'Metode pembayaran apa saja yang tersedia?', a: 'Transfer Virtual Account dari berbagai bank, QRIS (dapat dibayar dari GoPay, OVO, DANA, LinkAja, ShopeePay, atau mobile banking), dan gerai minimarket Alfamart atau Indomaret. Pilihan yang tampil mengikuti metode yang sedang aktif.' },
      { q: 'Berapa lama batas waktu pembayaran?', a: 'Batas waktu tertera di halaman pembayaran. Jika batas waktu pembayaran lewat, hubungi penjual untuk memeriksa status pembayaran dan pembatalan pesanan.' },
      { q: 'Saya sudah bayar tetapi status pesanan belum berubah.', a: 'Status biasanya berubah dalam beberapa menit setelah pembayaran terkonfirmasi. Jika belum berubah dalam satu jam, hubungi kami lewat Chat dan sertakan bukti pembayaran.' },
      { q: 'Apakah pembayaran di AmpelKuning aman?', a: 'Pembayaran dilakukan di halaman pembayaran yang aman. Kami tidak menyimpan data kartu atau rekening Anda dan tidak pernah meminta PIN, OTP, atau password.' },
    ],
  },
  {
    judul: 'Pengiriman',
    daftar: [
      { q: 'Ke mana saja barang dikirim?', a: 'Saat ini kami melayani pengiriman ke Pulau Jawa, Bali, dan Lampung.' },
      { q: 'Kurir apa yang tersedia?', a: 'Pilihan kurir ditampilkan saat checkout sesuai alamat, berat, dan ukuran paket, misalnya JNE, J&T, SiCepat, dan AnterAja.' },
      { q: 'Berapa lama barang diproses?', a: 'Barang ready stock diproses dalam 2 hari setelah pembayaran diterima. Produk pre-order diproses 3 sampai 14 hari sesuai yang tertera di halaman produk.' },
      { q: 'Bagaimana cara melacak pesanan?', a: 'Buka menu Pesanan lalu pilih pesanan Anda. Status pengiriman dan nomor resi tampil di kartu Pengiriman setelah barang dikirim.' },
    ],
  },
  {
    judul: 'Pre-order',
    daftar: [
      { q: 'Apa itu pre-order?', a: 'Produk pre-order dibuat atau dipesan setelah pembayaran diterima, sehingga butuh waktu proses 3 sampai 14 hari sebelum dikirim. Lama proses tertera di halaman produk dan keranjang.' },
      { q: 'Bisakah pesanan pre-order dibatalkan?', a: 'Dapat dibatalkan sebelum proses pembuatan atau pemesanan ke pemasok dimulai. Setelah itu tidak dapat dibatalkan, kecuali ada cacat atau kesalahan dari kami.' },
    ],
  },
  {
    judul: 'Retur dan refund',
    daftar: [
      { q: 'Barang yang saya terima rusak atau salah. Apa yang harus dilakukan?', a: 'Ajukan retur paling lambat 7 hari setelah barang diterima lewat Chat, sertakan nomor pesanan serta foto dan video pembukaan paket. Kami menjawab dalam 2 hari kerja.', isi: <>Ajukan retur paling lambat 7 hari setelah barang diterima lewat <Link className="underline" href="/chat">Chat</Link>, sertakan nomor pesanan serta foto dan video pembukaan paket. Kami menjawab dalam 2 hari kerja. Selengkapnya di <Link className="underline" href="/refund-policy">Refund Policy</Link>.</> },
      { q: 'Berapa lama pengembalian dana diproses?', a: 'Paling lambat 7 hari kerja setelah retur disetujui, dan barang kami terima bila perlu dikirim kembali.' },
      { q: 'Siapa yang menanggung ongkos kirim retur?', a: 'Kami menanggungnya bila masalah berasal dari kami atau pengiriman. Bila bukan karena kesalahan kami, ongkos kirim balik ditanggung pembeli.' },
    ],
  },
  {
    judul: 'Bantuan',
    daftar: [
      { q: 'Bagaimana cara menghubungi AmpelKuning?', a: `Lewat Chat di toko, WhatsApp ${KONTAK.telepon}, atau email ${KONTAK.email}. Layanan ${KONTAK.jam}.`, isi: <>Lewat <Link className="underline" href="/chat">Chat</Link> di toko, WhatsApp {KONTAK.telepon}, atau email <a className="underline" href={`mailto:${KONTAK.email}`}>{KONTAK.email}</a>. Layanan {KONTAK.jam}. Detail lain ada di <Link className="underline" href="/kontak">Kontak</Link>.</> },
    ],
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.flatMap((k) => k.daftar).map((t) => ({ '@type': 'Question', name: t.q, acceptedAnswer: { '@type': 'Answer', text: t.a } })),
}

export default function FaqPage() {
  return (
    <Halaman judul="FAQ" ringkas="Jawaban untuk pertanyaan yang paling sering diajukan. Tidak menemukan jawabannya? Hubungi kami lewat halaman Kontak.">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      {FAQ.map((k) => (
        <Bagian key={k.judul} judul={k.judul}>
          <div className="flex flex-col gap-2">
            {k.daftar.map((t) => (
              <details key={t.q} className="group rounded-lg border bg-card text-left open:border-primary">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3.5 font-bold [&::-webkit-details-marker]:hidden">
                  <span>{t.q}</span>
                  <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <div className="prose-id px-3.5 pb-3.5 text-muted-foreground">{t.isi ?? t.a}</div>
              </details>
            ))}
          </div>
        </Bagian>
      ))}
    </Halaman>
  )
}
