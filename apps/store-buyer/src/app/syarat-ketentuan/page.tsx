import type { Metadata } from 'next'
import Link from 'next/link'
import { Bagian, Halaman } from '@/components/Halaman'
import { KONTAK } from '@/lib/kontak'

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan',
  description: 'Ketentuan penggunaan situs dan pembelian di AmpelKuning: akun, pesanan, pembayaran, pengiriman, pre-order, retur, dan privasi.',
  alternates: { canonical: '/syarat-ketentuan' },
}

export default function SyaratKetentuanPage() {
  return (
    <Halaman
      judul="Syarat & Ketentuan"
      ringkas="Dengan menggunakan situs ampelkuning.com dan berbelanja di AmpelKuning, Anda menyetujui syarat dan ketentuan berikut. Mohon dibaca sebelum melakukan pemesanan."
      diperbarui="3 Oktober 2026"
    >
      <Bagian judul="1. Tentang kami">
        <p>
          Situs ini dikelola oleh {KONTAK.nama}, beralamat di {KONTAK.jalan}, {KONTAK.desa}, {KONTAK.kecamatan}, {KONTAK.kabupaten}, {KONTAK.provinsi} {KONTAK.kodePos}.
          Data kontak lengkap ada di halaman <Link className="underline" href="/kontak">Kontak</Link>.
        </p>
      </Bagian>

      <Bagian judul="2. Akun pengguna">
        <ul className="list-disc pl-5">
          <li>Anda masuk menggunakan akun Google. Anda bertanggung jawab atas keamanan akun dan seluruh aktivitas yang dilakukan dengannya.</li>
          <li>Data yang Anda berikan (nama, nomor telepon, alamat) harus benar dan terbaru. Kesalahan data dapat menyebabkan pesanan terlambat atau tidak sampai.</li>
          <li>Kami dapat membatasi atau menutup akun yang digunakan untuk penipuan, penyalahgunaan, atau pelanggaran ketentuan ini.</li>
        </ul>
      </Bagian>

      <Bagian judul="3. Produk dan harga">
        <ul className="list-disc pl-5">
          <li>Kami berusaha menampilkan foto, deskripsi, harga, dan stok seakurat mungkin. Warna pada layar dapat sedikit berbeda dengan barang asli.</li>
          <li>Harga dalam Rupiah dan dapat berubah sewaktu-waktu tanpa pemberitahuan. Harga yang berlaku adalah harga saat pesanan dibuat.</li>
          <li>Jika terjadi kesalahan harga yang jelas atau stok ternyata tidak tersedia, kami dapat membatalkan pesanan dan mengembalikan dana yang sudah dibayarkan secara penuh.</li>
        </ul>
      </Bagian>

      <Bagian judul="4. Pemesanan dan pembayaran">
        <ul className="list-disc pl-5">
          <li>Pesanan dianggap dibuat setelah Anda menyelesaikan checkout. Pesanan baru diproses setelah pembayaran kami terima.</li>
          <li>
            Pembayaran dilakukan di halaman pembayaran yang aman melalui metode yang tersedia (Virtual Account, QRIS, dan gerai minimarket). Rinciannya ada di{' '}
            <Link className="underline" href="/cara-berbelanja">Cara Berbelanja</Link>.
          </li>
          <li>Pembayaran harus diselesaikan sebelum batas waktu yang tertera. Jika batas waktu pembayaran lewat, hubungi penjual untuk memeriksa status pembayaran dan pembatalan pesanan.</li>
          <li>Kami tidak pernah meminta PIN, OTP, atau password Anda. Jangan membagikannya kepada siapa pun, termasuk yang mengaku sebagai kami.</li>
        </ul>
      </Bagian>

      <Bagian judul="5. Pengiriman">
        <ul className="list-disc pl-5">
          <li>Saat ini kami melayani pengiriman ke Pulau Jawa, Bali, dan Lampung.</li>
          <li>Ongkos kirim dan pilihan kurir ditampilkan saat checkout, sesuai alamat, berat, dan ukuran paket. Nomor resi tersedia di detail pesanan setelah barang dikirim.</li>
          <li>Lama proses pesanan ready stock adalah 2 hari sejak pembayaran diterima. Lama perjalanan paket ditentukan kurir dan dapat terlambat karena cuaca, hari libur, atau hal di luar kendali kami.</li>
          <li>Barang menjadi tanggung jawab kurir selama dalam perjalanan. Mohon periksa kondisi paket saat diterima dan rekam video saat membukanya.</li>
        </ul>
      </Bagian>

      <Bagian judul="6. Pre-order">
        <p>
          Produk berlabel pre-order dibuat atau dipesan setelah pembayaran diterima. Lama proses (3 sampai 14 hari) tertera di halaman produk dan di keranjang, dan
          berjalan sebelum barang dikirim. Pesanan pre-order tidak dapat dibatalkan setelah proses pembuatan atau pemesanan ke pemasok dimulai.
        </p>
      </Bagian>

      <Bagian judul="7. Retur dan pengembalian dana">
        <p>
          Retur, penukaran, dan pengembalian dana diatur dalam <Link className="underline" href="/refund-policy">Refund Policy</Link>. Ketentuan itu merupakan bagian dari
          syarat dan ketentuan ini.
        </p>
      </Bagian>

      <Bagian judul="8. Privasi">
        <p>
          Cara kami mengumpulkan dan menggunakan data pribadi Anda dijelaskan dalam <Link className="underline" href="/kebijakan-privasi">Kebijakan Privasi</Link>.
        </p>
      </Bagian>

      <Bagian judul="9. Penggunaan situs">
        <ul className="list-disc pl-5">
          <li>Anda dilarang mengganggu atau mencoba merusak situs, mengambil data secara massal tanpa izin, atau memakai situs untuk tujuan yang melanggar hukum.</li>
          <li>Konten situs (logo, foto, teks, dan desain) milik {KONTAK.nama} atau dipakai dengan izin pemiliknya. Dilarang menyalin atau memakainya untuk keperluan komersial tanpa izin tertulis.</li>
          <li>Nama dan logo bank, kurir, dan penyedia pembayaran yang tampil di situs adalah milik masing-masing pemiliknya dan hanya menunjukkan layanan yang tersedia.</li>
        </ul>
      </Bagian>

      <Bagian judul="10. Batasan tanggung jawab">
        <p>
          Kami berupaya menjaga situs tetap berjalan, tetapi tidak menjamin situs bebas dari gangguan atau kesalahan. Sejauh diizinkan hukum, tanggung jawab kami atas
          suatu pesanan terbatas pada nilai pesanan tersebut. Ketentuan ini tidak mengurangi hak Anda sebagai konsumen menurut Undang-Undang Perlindungan Konsumen.
        </p>
      </Bagian>

      <Bagian judul="11. Perubahan ketentuan">
        <p>
          Kami dapat memperbarui ketentuan ini. Versi terbaru selalu ada di halaman ini beserta tanggal pembaruannya. Dengan tetap menggunakan situs setelah perubahan,
          Anda dianggap menyetujui ketentuan yang baru.
        </p>
      </Bagian>

      <Bagian judul="12. Hukum dan penyelesaian sengketa">
        <p>
          Ketentuan ini tunduk pada hukum Republik Indonesia. Jika terjadi perselisihan, kami mengutamakan penyelesaian secara musyawarah. Hubungi kami lebih dulu lewat{' '}
          <Link className="underline" href="/kontak">halaman Kontak</Link> atau <a className="underline" href={`mailto:${KONTAK.email}`}>{KONTAK.email}</a>.
        </p>
      </Bagian>
    </Halaman>
  )
}
