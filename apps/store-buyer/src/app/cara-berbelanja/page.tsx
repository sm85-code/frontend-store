import { getKontak } from '@/lib/kontak'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Bagian, Halaman } from '@/components/Halaman'
import { DaftarKurir } from '@/components/KurirLogo'
import { LogoPembayaran, type MetodeLogo } from '@/components/LogoPembayaran'
import { KURIR } from '@/lib/kurir'

export async function generateMetadata(): Promise<Metadata> {
  const { KONTAK } = await getKontak()
  return {
  title: 'Cara Berbelanja',
  description: `Langkah belanja di ${KONTAK.nama}, metode pembayaran, pengiriman, dan lama proses pesanan.`,
  alternates: { canonical: '/cara-berbelanja' },
}
}

const BANK: MetodeLogo[] = [
  { slug: 'bca', nama: 'BCA' },
  { slug: 'mandiri', nama: 'Bank Mandiri', tinggi: 28 },
  { slug: 'bri', nama: 'BRI', tinggi: 28 },
  { slug: 'bni', nama: 'BNI', tinggi: 28 },
  { slug: 'cimb-niaga', nama: 'CIMB Niaga', tinggi: 24 },
  { slug: 'permata', nama: 'PermataBank', tinggi: 24 },
  { slug: 'bsi', nama: 'Bank Syariah Indonesia', tinggi: 28 },
  { slug: 'danamon', nama: 'Danamon', tinggi: 34 },
  { slug: 'muamalat', nama: 'Bank Muamalat', tinggi: 32 },
]
const QRIS: MetodeLogo[] = [{ slug: 'qris', nama: 'QRIS', tinggi: 40 }]
const GERAI: MetodeLogo[] = [
  { slug: 'alfamart', nama: 'Alfamart', tinggi: 28 },
  { slug: 'indomaret', nama: 'Indomaret', tinggi: 28 },
]

const LANGKAH = [
  ['Cari produk', 'Telusuri beranda, pilih kategori, atau ketik nama produk di kolom pencarian.'],
  ['Pilih varian', 'Jika produk punya varian (misalnya ukuran atau warna), pilih salah satu sebelum menambahkannya ke keranjang.'],
  ['Masuk dengan Google', 'Masuk dengan akun Google Anda. Tidak perlu membuat password baru.'],
  ['Isi alamat pengiriman', 'Lengkapi provinsi, kota/kabupaten, kecamatan, desa/kelurahan, kode pos, dan alamat lengkap. Saat ini kami melayani Pulau Jawa, Bali, dan Lampung.'],
  ['Checkout dan bayar', 'Periksa ringkasan pesanan, lalu lanjutkan ke pembayaran dan selesaikan sebelum batas waktunya.'],
  ['Pantau pesanan', 'Status pesanan bisa dilihat di menu Pesanan. Pertanyaan bisa disampaikan lewat Chat.'],
] as const

export default async function CaraBerbelanjaPage() {
  const { KONTAK } = await getKontak()
  return (
    <Halaman judul="Cara Berbelanja" ringkas={`Belanja di ${KONTAK.nama} cukup beberapa langkah.`}>
      <Bagian judul="Langkah belanja">
        <ol className="flex flex-col gap-3">
          {LANGKAH.map(([judul, isi], i) => (
            <li key={judul} className="flex gap-3.5 rounded-lg border bg-card p-3.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-sm font-extrabold text-primary-foreground">{i + 1}</span>
              <div>
                <p className="font-bold">{judul}</p>
                <p className="text-muted-foreground">{isi}</p>
              </div>
            </li>
          ))}
        </ol>
      </Bagian>

      <Bagian judul="Metode pembayaran">
        <p>
          Pembayaran dilakukan di halaman pembayaran yang aman setelah Anda menekan tombol bayar. Metode yang tersedia:
        </p>
        <ul className="flex flex-col gap-2.5">
          <li className="rounded-lg border bg-card p-3.5">
            <p className="font-bold">Transfer Virtual Account</p>
            <p className="mb-3 text-muted-foreground">Bayar lewat ATM, mobile banking, atau internet banking dari bank-bank besar maupun bank daerah.</p>
            <LogoPembayaran metode={BANK} />
          </li>
          <li className="rounded-lg border bg-card p-3.5">
            <p className="font-bold">QRIS</p>
            <p className="mb-3 text-muted-foreground">Satu kode QR untuk berbagai aplikasi pembayaran, termasuk GoPay, OVO, DANA, LinkAja, ShopeePay, dan mobile banking.</p>
            <LogoPembayaran metode={QRIS} />
          </li>
          <li className="rounded-lg border bg-card p-3.5">
            <p className="font-bold">Gerai minimarket</p>
            <p className="mb-3 text-muted-foreground">Bayar tunai di Alfamart atau Indomaret dengan kode pembayaran dari kami.</p>
            <LogoPembayaran metode={GERAI} />
          </li>
        </ul>
        <p>
          Pilihan yang tampil di halaman pembayaran mengikuti metode yang sedang aktif. Pesanan diproses setelah pembayaran
          kami terima. Kami tidak pernah meminta PIN, OTP, atau password Anda lewat chat.
        </p>
      </Bagian>

      <Bagian judul="Lama proses dan pengiriman">
        <ul className="list-disc pl-5">
          <li>
            <strong>Ready stock:</strong> pesanan diproses dalam 2 hari setelah pembayaran diterima.
          </li>
          <li>
            <strong>Pre-order:</strong> lama proses tertera di halaman produk (3 sampai 14 hari) dan di keranjang.
          </li>
          <li>Ongkos kirim dan layanan kurir ditampilkan saat checkout. Nomor resi muncul di detail pesanan setelah barang dikirim.</li>
        </ul>
        <p>Kurir yang dapat tersedia (tergantung alamat tujuan, berat, dan ukuran paket):</p>
        <DaftarKurir kurir={KURIR} />
      </Bagian>

      <Bagian judul="Butuh bantuan?">
        <p>
          Tanyakan stok, ukuran, atau status pesanan lewat <Link className="underline" href="/chat">halaman Chat</Link>. Untuk
          barang yang bermasalah, lihat <Link className="underline" href="/refund-policy">Refund Policy</Link>.
        </p>
      </Bagian>
    </Halaman>
  )
}
