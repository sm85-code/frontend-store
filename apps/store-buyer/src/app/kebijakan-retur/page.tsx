import type { Metadata } from 'next'
import Link from 'next/link'
import { Bagian, Halaman } from '@/components/Halaman'

export const metadata: Metadata = {
  title: 'Kebijakan Retur',
  description: 'Syarat dan cara mengajukan retur, penukaran, atau pengembalian dana di Ampelkuning.',
  alternates: { canonical: '/kebijakan-retur' },
}

export default function KebijakanReturPage() {
  return (
    <Halaman
      judul="Kebijakan Retur"
      ringkas="Barang yang rusak, cacat, atau tidak sesuai pesanan berhak Anda tukar atau kembalikan dananya, sesuai Undang-Undang Perlindungan Konsumen. Berikut ketentuan dan caranya."
      diperbarui="2 Oktober 2026"
    >
      <Bagian judul="Barang yang dapat diretur">
        <p>Anda dapat mengajukan retur bila barang yang diterima:</p>
        <ul className="list-disc pl-5">
          <li>rusak, pecah, atau cacat (termasuk rusak akibat pengiriman);</li>
          <li>tidak sesuai pesanan: produk, varian (ukuran atau warna), atau jumlahnya keliru;</li>
          <li>kurang atau tidak lengkap dibanding yang tertera di pesanan;</li>
          <li>tidak sesuai deskripsi atau foto produk secara jelas.</li>
        </ul>
      </Bagian>

      <Bagian judul="Batas waktu pengajuan">
        <p>
          Ajukan retur paling lambat <strong>7 hari</strong> setelah barang diterima (menurut status pengiriman atau nomor
          resi). Pengajuan dilakukan lewat <Link className="underline" href="/chat">halaman Chat</Link>. Kami menjawab
          pengajuan dalam <strong>2 hari kerja</strong>.
        </p>
      </Bagian>

      <Bagian judul="Cara mengajukan">
        <ol className="list-decimal pl-5">
          <li>Buka Chat, tuliskan nomor pesanan dan jelaskan masalahnya.</li>
          <li>
            Lampirkan foto barang, kemasan, dan label pengiriman. Video saat paket dibuka (tanpa jeda dan tanpa dipotong)
            sangat membantu, terutama untuk barang rusak atau kurang.
          </li>
          <li>Kami memeriksa bukti Anda lalu memberi tahu keputusan: penukaran, pengembalian dana, atau permintaan tambahan bukti.</li>
          <li>Jika barang perlu dikirim kembali, kami memberi tahu alamat dan caranya. Simpan resi pengiriman balik.</li>
        </ol>
      </Bagian>

      <Bagian judul="Syarat barang yang dikembalikan">
        <ul className="list-disc pl-5">
          <li>Dikirim bersama kemasan asli, label, dan kelengkapannya (aksesori, hadiah, dokumen).</li>
          <li>Belum dipakai atau dicuci, kecuali pemakaian itu yang menunjukkan cacatnya.</li>
          <li>Bukti yang diminta tersedia, sehingga kami dapat memastikan masalahnya bukan akibat penggunaan setelah diterima.</li>
        </ul>
      </Bagian>

      <Bagian judul="Penukaran atau pengembalian dana">
        <ul className="list-disc pl-5">
          <li>
            <strong>Penukaran:</strong> kami kirim barang pengganti yang sama bila stok tersedia.
          </li>
          <li>
            <strong>Pengembalian dana:</strong> bila barang pengganti tidak tersedia atau Anda memilih dana kembali. Dana
            dikembalikan sebesar harga barang yang bermasalah, ke rekening atau dompet digital Anda, paling lambat 7 hari
            kerja setelah retur disetujui (dan barang kami terima, bila perlu dikirim balik).
          </li>
          <li>
            <strong>Ongkos kirim retur</strong> ditanggung Ampelkuning bila masalahnya berasal dari kami atau pengiriman. Bila
            retur bukan karena kesalahan kami, ongkos kirim balik ditanggung pembeli.
          </li>
        </ul>
      </Bagian>

      <Bagian judul="Pembatalan sebelum diproses">
        <p>
          Ingin membatalkan pesanan? Hubungi kami lewat Chat <strong>sebelum pesanan diproses atau dikirim</strong>. Pesanan yang
          dibatalkan sebelum diproses dikembalikan dananya penuh. Setelah barang dikirim, pembatalan tidak dapat dilakukan
          dan berlaku ketentuan retur di atas.
        </p>
      </Bagian>

      <Bagian judul="Yang tidak dapat diretur">
        <ul className="list-disc pl-5">
          <li>Barang dalam kondisi baik dan sesuai pesanan, yang tidak jadi diinginkan setelah diterima.</li>
          <li>Kerusakan akibat pemakaian, perawatan yang salah, atau penanganan setelah barang diterima.</li>
          <li>Barang yang sudah diubah, dipakai, atau kemasan dan labelnya hilang sehingga tidak dapat dijual kembali (kecuali cacat).</li>
          <li>
            Pesanan <strong>pre-order</strong> tidak dapat dibatalkan setelah proses pembuatan atau pemesanan ke pemasok
            dimulai. Cacat dan kesalahan dari kami tetap dapat diretur seperti biasa.
          </li>
        </ul>
      </Bagian>

      <Bagian judul="Bantuan">
        <p>
          Ada pertanyaan tentang retur? Hubungi kami lewat <Link className="underline" href="/chat">Chat</Link>. Cara
          pemesanan dan pembayaran dijelaskan di <Link className="underline" href="/cara-berbelanja">Cara Berbelanja</Link>.
        </p>
      </Bagian>
    </Halaman>
  )
}
