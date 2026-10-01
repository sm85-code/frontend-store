import type { Metadata } from 'next'
import Link from 'next/link'
import { Bagian, Halaman } from '@/components/Halaman'

export const metadata: Metadata = {
  title: 'Cara Berbelanja',
  description: 'Langkah belanja di Ampelkuning, metode pembayaran, pengiriman, dan lama proses pesanan.',
  alternates: { canonical: '/cara-berbelanja' },
}

const LANGKAH = [
  ['Cari produk', 'Telusuri beranda, pilih kategori, atau ketik nama produk di kolom pencarian.'],
  ['Pilih varian', 'Jika produk punya varian (misalnya ukuran atau warna), pilih salah satu sebelum menambahkannya ke keranjang.'],
  ['Masuk dengan Google', 'Masuk dengan akun Google Anda. Tidak perlu membuat password baru.'],
  ['Isi alamat pengiriman', 'Lengkapi provinsi, kota/kabupaten, kecamatan, desa/kelurahan, kode pos, dan alamat lengkap. Saat ini kami melayani Pulau Jawa, Bali, dan Lampung.'],
  ['Checkout dan bayar', 'Periksa ringkasan pesanan, lalu lanjutkan ke pembayaran dan selesaikan sebelum batas waktunya.'],
  ['Pantau pesanan', 'Status pesanan bisa dilihat di menu Pesanan. Pertanyaan bisa disampaikan lewat Chat.'],
] as const

export default function CaraBerbelanjaPage() {
  return (
    <Halaman judul="Cara Berbelanja" ringkas="Belanja di Ampelkuning cukup beberapa langkah. Berikut panduan singkatnya.">
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
          Pembayaran dilakukan di halaman pembayaran yang aman setelah Anda menekan tombol bayar. Metode yang tersedia
          antara lain:
        </p>
        <ul className="list-disc pl-5">
          <li>Transfer bank melalui Virtual Account</li>
          <li>QRIS</li>
          <li>Dompet digital</li>
        </ul>
        <p>
          Pilihan yang tampil di halaman pembayaran dapat berbeda sewaktu-waktu sesuai metode yang sedang aktif. Pesanan
          diproses setelah pembayaran kami terima. Kami tidak pernah meminta Anda mengirim PIN, OTP, atau password lewat chat.
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
      </Bagian>

      <Bagian judul="Butuh bantuan?">
        <p>
          Tanyakan stok, ukuran, atau status pesanan lewat <Link className="underline" href="/chat">halaman Chat</Link>. Untuk
          barang yang bermasalah, lihat <Link className="underline" href="/kebijakan-retur">Kebijakan Retur</Link>.
        </p>
      </Bagian>
    </Halaman>
  )
}
